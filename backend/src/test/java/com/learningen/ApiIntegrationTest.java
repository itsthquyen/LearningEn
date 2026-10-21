package com.learningen;

import com.fasterxml.jackson.databind.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class ApiIntegrationTest {
    private static org.springframework.test.web.servlet.request.RequestPostProcessor csrf() {
        return request -> {
            String token=UUID.randomUUID().toString();
            request.setCookies(new jakarta.servlet.http.Cookie("XSRF-TOKEN",token));
            request.addHeader("X-XSRF-TOKEN",token);
            return request;
        };
    }
    @Autowired MockMvc mvc; @Autowired ObjectMapper mapper; @Autowired JdbcTemplate db; @Autowired PasswordEncoder encoder;
    private MockHttpSession login() throws Exception {
        var result=mvc.perform(post("/api/v1/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"learner@example.com\",\"password\":\"test-password-12345\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.email").value("learner@example.com")).andReturn();
        return (MockHttpSession)result.getRequest().getSession(false);
    }
    @Test void cookieCsrfLoginRotationAndLogout() throws Exception {
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isForbidden());
        var initial=mvc.perform(get("/api/v1/auth/csrf")).andExpect(status().isOk()).andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertThat(initial).isNotNull();
        var result=mvc.perform(post("/api/v1/auth/login").cookie(initial).header("X-XSRF-TOKEN",initial.getValue()).contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"learner@example.com\",\"password\":\"test-password-12345\"}")).andExpect(status().isOk()).andReturn();
        MockHttpSession session=(MockHttpSession)result.getRequest().getSession(false);
        var rotated=Arrays.stream(result.getResponse().getCookies()).filter(c->c.getName().equals("XSRF-TOKEN")&&!c.getValue().isBlank()).reduce((a,b)->b).orElseThrow();
        assertThat(rotated.getValue()).isNotEqualTo(initial.getValue());
        mvc.perform(get("/api/v1/auth/me").session(session)).andExpect(status().isOk());
        mvc.perform(post("/api/v1/auth/logout").session(session).cookie(rotated).header("X-XSRF-TOKEN",rotated.getValue())).andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
    }
    @Test void notebookReviewIdempotencyDashboardAndErase() throws Exception {
        MockHttpSession session=login();
        String item="{\"expression\":\"take off\",\"meaning\":\"depart\",\"context\":\"travel\",\"example\":\"The plane takes off.\",\"notes\":\"phrasal verb\",\"tags\":\"travel\",\"reviewEnabled\":true}";
        var created=mvc.perform(post("/api/v1/learning-items").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(item)).andExpect(status().isCreated()).andReturn();
        String itemId=mapper.readTree(created.getResponse().getContentAsString()).get("id").asText();
        mvc.perform(get("/api/v1/learning-items").param("q","take").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(itemId));
        JsonNode cards=mapper.readTree(mvc.perform(get("/api/v1/review-cards?due=true").session(session)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        String cardId="";for(JsonNode card:cards) if(card.get("learningItemId").asText().equals(itemId)) cardId=card.get("id").asText();
        assertThat(cardId).isNotBlank();
        String review="{\"requestId\":\""+UUID.randomUUID()+"\",\"rating\":\"GOOD\",\"version\":0}";
        for(int i=0;i<2;i++) mvc.perform(post("/api/v1/review-cards/"+cardId+"/reviews").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(review)).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(1));
        mvc.perform(post("/api/v1/review-cards/"+cardId+"/reviews").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(review.replace(mapper.readTree(review).get("requestId").asText(),UUID.randomUUID().toString()))).andExpect(status().isConflict());
        mvc.perform(get("/api/v1/dashboard").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.weeklyActivity.length()").value(7));
        mvc.perform(get("/api/v1/data-export").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.profile.password_hash").doesNotExist());
        mvc.perform(delete("/api/v1/personal-data").session(session).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/learning-items").session(session)).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/v1/auth/me").session(session)).andExpect(status().isOk());
    }
    @Test void ownerScopingAndUnavailableAi() throws Exception {
        UUID stranger=UUID.randomUUID(),item=UUID.randomUUID(),conversation=UUID.randomUUID();
        db.update("insert into accounts(id,email,password_hash,display_name) values(?,?,?,?)",stranger,stranger+"@example.com",encoder.encode("other-password-123"),"Other");
        db.update("insert into learning_items(id,owner_id,expression,meaning,context,example,notes,tags,created_at,review_enabled) values(?,?,'secret','secret','','','','',CURRENT_TIMESTAMP,true)",item,stranger);
        db.update("insert into conversations(id,owner_id,title,created_at) values(?,?,'Private',CURRENT_TIMESTAMP)",conversation,stranger);
        MockHttpSession session=login();
        mvc.perform(get("/api/v1/learning-items?q=secret").session(session)).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(delete("/api/v1/learning-items/"+item).session(session).with(csrf())).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/conversations/"+conversation+"/messages").session(session)).andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/assistant-requests").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Hello\",\"mode\":\"AUTO\",\"requestId\":\""+UUID.randomUUID()+"\"}")).andExpect(status().isServiceUnavailable());
    }
    @Test void profileValidationAndConversationFlow() throws Exception {
        MockHttpSession session=login();
        mvc.perform(patch("/api/v1/profile").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"displayName\":\"Student\",\"dailyMinutes\":20,\"timeZone\":\"Asia/Ho_Chi_Minh\",\"retainHistory\":true}")).andExpect(status().isOk()).andExpect(jsonPath("$.dailyMinutes").value(20));
        mvc.perform(patch("/api/v1/profile").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"displayName\":\"Student\",\"dailyMinutes\":20,\"timeZone\":\"Invalid/Zone\",\"retainHistory\":true}")).andExpect(status().isBadRequest());
        var result=mvc.perform(post("/api/v1/conversations").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Practice\"}")).andExpect(status().isCreated()).andReturn();
        String id=mapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
        mvc.perform(get("/api/v1/conversations/"+id+"/messages").session(session)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(delete("/api/v1/conversations/"+id).session(session).with(csrf())).andExpect(status().isNoContent());
    }
}
