package com.learningen;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class B1ExamDraftIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate db;
    @Autowired B1ExamController exam;
    private static final String A = "draft-a@example.com", B = "draft-b@example.com";
    private static final String DRAFT = "/api/v1/b1-exam/draft";

    @BeforeEach void setup() {
        for (String email : new String[]{A, B}) {
            if (db.queryForObject("select count(*) from accounts where email=?", Long.class, email) == 0)
                db.update("insert into accounts(id,email,password_hash,display_name) values(?,?,?,?)", UUID.randomUUID(), email, "unused", "Draft tester");
            db.update("delete from b1_exam_drafts where owner_id=(select id from accounts where email=?)", email);
        }
    }
    private String putDraft(String email, String body, int status) throws Exception {
        return mvc.perform(put(DRAFT).with(user(email)).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().is(status)).andReturn().getResponse().getContentAsString();
    }
    @Test void isolationLockingReplayAndCsrf() throws Exception {
        mvc.perform(get(DRAFT)).andExpect(status().isUnauthorized());
        mvc.perform(get(DRAFT).with(user(A))).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(0));
        String first = "{\"responses\":{\"sample-reading-01\":\"A\"},\"version\":0}";
        mvc.perform(put(DRAFT).with(user(A)).contentType(MediaType.APPLICATION_JSON).content(first)).andExpect(status().isForbidden());
        putDraft(A, first, 200);
        putDraft(A, first, 200);
        putDraft(A, "{\"responses\":{\"sample-reading-01\":\"B\"},\"version\":0}", 409);
        mvc.perform(get(DRAFT).with(user(B))).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(0));
        mvc.perform(get(DRAFT).with(user(A))).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(1)).andExpect(jsonPath("$.responses.sample-reading-01").value("A"));
    }
    @Test void validatesContentAndLimits() throws Exception {
        putDraft(A, "{}", 400);
        putDraft(A, "{\"responses\":{\"unknown\":\"x\"},\"version\":0}", 400);
        putDraft(A, "{\"responses\":{\"sample-reading-01\":\"invalid\"},\"version\":0}", 400);
        putDraft(A, "{\"responses\":{\"sample-reading-01\":1},\"version\":0}", 400);
        ObjectNode responses = mapper.createObjectNode();
        JsonNode unavailable = null;
        for (JsonNode section : exam.exam().path("sections")) for (JsonNode group : section.path("groups")) for (JsonNode q : group.path("questions")) {
            if (q.path("unavailable").asBoolean() || q.path("type").asText().equals("unavailable")) { unavailable = q; continue; }
            String type = q.path("type").asText();
            responses.put(q.path("id").asText(), type.equals("choice") || type.equals("matching") ? q.path("options").get(0).path("id").asText() : "text");
        }
        ObjectNode body = mapper.createObjectNode(); body.set("responses", responses); body.put("version", 0);
        putDraft(A, body.toString(), 200);
        responses.put(unavailable.path("id").asText(), "text");
        body.put("version", 1); putDraft(A, body.toString(), 400);
        for (int i = 0; i < 615; i++) responses.put("extra-" + i, "x");
        putDraft(A, body.toString(), 400);
    }
    @Test void largeValidDraftCanBeExportedAndRestored() throws Exception {
        ObjectNode responses = mapper.createObjectNode();
        int count = 0;
        for (JsonNode section : exam.exam().path("sections")) for (JsonNode group : section.path("groups")) for (JsonNode q : group.path("questions")) {
            if ((q.path("type").asText().equals("writing") || q.path("type").asText().equals("speaking")) && count < 30) {
                responses.put(q.path("id").asText(), "ắ".repeat(3500)); count++;
            }
        }
        ObjectNode body = mapper.createObjectNode(); body.set("responses", responses); body.put("version", 0);
        putDraft(A, body.toString(), 200);
        String exported = mvc.perform(get("/api/v1/data-export").with(user(A))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        mvc.perform(delete("/api/v1/personal-data").with(user(A)).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(post("/api/v1/data-import").with(user(A)).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(exported)).andExpect(status().isOk());
        mvc.perform(get(DRAFT).with(user(A))).andExpect(jsonPath("$.version").value(1));
    }
    @Test void backupRoundTripOldBackupAndClear() throws Exception {
        putDraft(A, "{\"responses\":{\"sample-reading-01\":\"A\"},\"version\":0}", 200);
        String exported = mvc.perform(get("/api/v1/data-export").with(user(A))).andExpect(status().isOk()).andExpect(jsonPath("$.b1ExamDrafts[0].version").value(1)).andReturn().getResponse().getContentAsString();
        mvc.perform(delete("/api/v1/personal-data").with(user(A)).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(get(DRAFT).with(user(A))).andExpect(jsonPath("$.version").value(0));
        mvc.perform(post("/api/v1/data-import").with(user(A)).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(exported)).andExpect(status().isOk());
        mvc.perform(get(DRAFT).with(user(A))).andExpect(jsonPath("$.version").value(1));
        mvc.perform(delete("/api/v1/personal-data").with(user(A)).with(csrf())).andExpect(status().isNoContent());
        ObjectNode invalid = (ObjectNode) mapper.readTree(exported);
        ((ObjectNode) invalid.path("b1ExamDrafts").get(0)).put("responses", "{} {} ");
        mvc.perform(post("/api/v1/data-import").with(user(A)).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(invalid.toString())).andExpect(status().isBadRequest());
        invalid = (ObjectNode) mapper.readTree(exported);
        ((ObjectNode) invalid.path("b1ExamDrafts").get(0)).put("version", 0);
        mvc.perform(post("/api/v1/data-import").with(user(A)).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(invalid.toString())).andExpect(status().isBadRequest());
        ObjectNode old = (ObjectNode) mapper.readTree(exported); old.remove("b1ExamDrafts");
        mvc.perform(post("/api/v1/data-import").with(user(A)).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(old.toString())).andExpect(status().isOk());
        mvc.perform(get(DRAFT).with(user(A))).andExpect(jsonPath("$.version").value(0));
    }
}
