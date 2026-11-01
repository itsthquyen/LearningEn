package com.learningen;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class B1ExamIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test void examRequiresAuthenticationAndSeparatesAnswers() throws Exception {
        mvc.perform(get("/api/v1/b1-exam")).andExpect(status().isUnauthorized());
        var response = mvc.perform(get("/api/v1/b1-exam").with(user("learner@example.com"))).andExpect(status().isOk()).andReturn();
        JsonNode exam = mapper.readTree(response.getResponse().getContentAsString());
        assertThat(exam.path("sections").size()).isEqualTo(10);
        Set<String> ids = new HashSet<>();
        int total = 0, listening = 0, unavailable = 0;
        for (JsonNode section : exam.path("sections")) for (JsonNode group : section.path("groups")) for (JsonNode question : group.path("questions")) {
            String id = question.path("id").asText();
            assertThat(ids.add(id)).as("duplicate question " + id).isTrue();
            assertThat(question.has("answer")).as(id).isFalse();
            assertThat(question.has("explanation")).as(id).isFalse();
            total++;
            if ("listening".equals(section.path("kind").asText())) listening++;
            if (question.path("unavailable").asBoolean(false) || "unavailable".equals(question.path("type").asText())) unavailable++;
        }
        assertThat(total).isEqualTo(614);
        assertThat(listening).isEqualTo(195);
        assertThat(unavailable).isGreaterThanOrEqualTo(13);
        JsonNode answers;
        try (var input = new ClassPathResource("content/b1-exam-answers.json").getInputStream()) {
            answers = mapper.readTree(input);
        }
        for (JsonNode section : exam.path("sections")) for (JsonNode group : section.path("groups")) for (JsonNode question : group.path("questions")) {
            String id = question.path("id").asText();
            if ("listening".equals(section.path("kind").asText())) assertThat(answers.has(id)).as(id).isFalse();
            else if (!"unavailable".equals(question.path("type").asText()) && !question.path("unavailable").asBoolean(false)) {
                assertThat(answers.has(id)).as(id).isTrue();
                assertThat(answers.path(id).path("explanation").asText()).as(id).isNotBlank();
                assertThat(answers.path(id).path("translation").asText()).as(id).isNotBlank();
            }
            if (question.hasNonNull("image")) {
                String name = question.path("image").asText().substring("/api/v1/b1-exam/images/".length());
                assertThat(new ClassPathResource("content/b1-exam-images/" + name).exists()).as(id).isTrue();
            }
        }
        mvc.perform(get("/api/v1/b1-exam/answers/sample-reading-01").with(user("learner@example.com"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.answer").exists()).andExpect(jsonPath("$.explanation").exists()).andExpect(jsonPath("$.translation").exists());
        for (String id : new String[]{"sample-listening-01", "ket5-t1-01", "ket6-t1-01", "ket7-t1-01", "grammar-101"}) {
            mvc.perform(get("/api/v1/b1-exam/answers/" + id).with(user("learner@example.com"))).andExpect(status().isNotFound());
        }
        mvc.perform(get("/api/v1/b1-exam/answers/not-a-question").with(user("learner@example.com"))).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/b1-exam/images/sample-listening-01.png").with(user("learner@example.com"))).andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.IMAGE_PNG));
        mvc.perform(get("/api/v1/b1-exam/images/no-such-image.png").with(user("learner@example.com"))).andExpect(status().isNotFound());
    }
}
