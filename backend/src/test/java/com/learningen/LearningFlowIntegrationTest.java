package com.learningen;

import com.fasterxml.jackson.databind.*;
import com.learningen.data.BackupService;
import com.learningen.study.StudyService;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties="spring.datasource.url=jdbc:h2:mem:learning-flow;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc @ActiveProfiles("test") @Import(LearningFlowIntegrationTest.TimeTestConfig.class)
class LearningFlowIntegrationTest {
    static class MutableClock extends Clock {
        Instant now=Instant.parse("2026-10-21T16:59:50Z");
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return Clock.fixed(now,zone); }
        @Override public Instant instant() { return now; }
    }
    @TestConfiguration static class TimeTestConfig { @Bean @Primary MutableClock testClock() { return new MutableClock(); } }
    @Autowired MockMvc mvc;@Autowired ObjectMapper mapper;@Autowired JdbcTemplate db;@Autowired MutableClock clock;@Autowired StudyService study;@Autowired BackupService backup;
    UUID owner;String email;
    @BeforeEach void account() {
        owner=UUID.randomUUID();email=owner+"@example.com";clock.now=Instant.parse("2026-10-21T16:59:50Z");
        db.update("insert into accounts(id,email,password_hash,display_name,time_zone) values(?,?,'not-used','Test','Asia/Ho_Chi_Minh')",owner,email);
    }
    private ResultActions call(MockHttpServletRequestBuilder request) throws Exception {
        String token=UUID.randomUUID().toString();
        return mvc.perform(request.with(user(email)).cookie(new jakarta.servlet.http.Cookie("XSRF-TOKEN",token)).header("X-XSRF-TOKEN",token));
    }
    private JsonNode json(ResultActions result) throws Exception { return mapper.readTree(result.andReturn().getResponse().getContentAsByteArray()); }
    private MockHttpServletRequestBuilder body(MockHttpServletRequestBuilder request,Object value) throws Exception { return request.contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsBytes(value)); }
    private UUID firstLesson() throws Exception {
        JsonNode courses=json(call(get("/api/v1/courses")).andExpect(status().isOk()));assertThat(courses.get(0).path("lessonCount").asInt()).isEqualTo(16);
        var lessons=json(call(get("/api/v1/courses/"+courses.get(0).path("id").asText()+"/lessons")).andExpect(status().isOk()));return UUID.fromString(lessons.get(0).path("id").asText());
    }
    private Map<String,String> correct(UUID lesson) throws Exception {
        var keys=mapper.readTree(db.queryForObject("select questions from lessons where id=?",String.class,lesson));Map<String,String> answers=new LinkedHashMap<>();keys.forEach(q->answers.put(q.path("id").asText(),q.path("answer").asText()));return answers;
    }
    @Test void frameworkErrorsKeepStandardHttpStatusInsteadOfBecoming500() throws Exception {
        call(body(post("/api/v1/dashboard"),Map.of())).andExpect(status().isMethodNotAllowed()).andExpect(jsonPath("$.status").value(405));
        call(post("/api/v1/assistant-requests").contentType(MediaType.TEXT_PLAIN).content("hello")).andExpect(status().isUnsupportedMediaType());
        call(get("/api/v1/no-such-resource")).andExpect(status().isNotFound());
    }
    @Test void readingDoesNotGrantProgressAndDraftResumesWithoutAnswerLeak() throws Exception {
        UUID lesson=firstLesson();JsonNode detail=json(call(get("/api/v1/lessons/"+lesson)).andExpect(status().isOk()));
        assertThat(detail.path("status").asText()).isEqualTo("NOT_STARTED");assertThat(detail.path("questions").get(0).has("answer")).isFalse();
        call(body(put("/api/v1/lessons/"+lesson+"/draft"),Map.of("answers",Map.of("q1","is")))).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        call(get("/api/v1/lessons/"+lesson)).andExpect(jsonPath("$.draftAnswers.q1").value("is")).andExpect(jsonPath("$.bestScore").isEmpty());
        call(get("/api/v1/dashboard")).andExpect(jsonPath("$.completedLessons").value(0));
    }
    @Test void assistedAttemptsDoNotCountAsMasteryAndReplayIsSafe() throws Exception {
        UUID lesson=firstLesson();UUID request=UUID.randomUUID();var input=Map.of("answers",correct(lesson),"requestId",request,"assisted",true);
        JsonNode result=json(call(body(post("/api/v1/lessons/"+lesson+"/attempts"),input)).andExpect(status().isOk()).andExpect(jsonPath("$.score").value(100)).andExpect(jsonPath("$.passed").value(false)));
        call(body(post("/api/v1/lessons/"+lesson+"/attempts"),input)).andExpect(jsonPath("$.id").value(result.path("id").asText()));
        call(body(post("/api/v1/lessons/"+lesson+"/attempts"),Map.of("answers",correct(lesson),"requestId",request,"assisted",false))).andExpect(status().isConflict());
        call(get("/api/v1/lessons/"+lesson)).andExpect(jsonPath("$.status").value("PRACTICED")).andExpect(jsonPath("$.bestScore").isEmpty());
        call(body(post("/api/v1/lessons/"+lesson+"/attempts"),Map.of("answers",correct(lesson),"requestId",UUID.randomUUID(),"assisted",false))).andExpect(status().isOk()).andExpect(jsonPath("$.passed").value(true));
        call(get("/api/v1/dashboard")).andExpect(jsonPath("$.completedLessons").value(1));
    }
    @Test void incompleteUnknownAndInvalidAnswersAreRejected() throws Exception {
        UUID lesson=firstLesson();
        for(var answers:List.of(Map.of("q1","is"),Map.of("unknown","is"),Map.of("q1","not an option","q2","x","q3","x")))
            call(body(post("/api/v1/lessons/"+lesson+"/attempts"),Map.of("answers",answers,"requestId",UUID.randomUUID(),"assisted",false))).andExpect(status().isBadRequest());
        call(get("/api/v1/lessons/"+UUID.randomUUID())).andExpect(status().isNotFound());
    }
    @Test void writingIsRecordedWithoutAnInventedScore() throws Exception {
        UUID lesson=db.queryForObject("select id from lessons where kind='APPLICATION'",UUID.class);
        call(body(post("/api/v1/lessons/"+lesson+"/attempts"),Map.of("answers",Map.of("writing","Hi, I am An. Can we meet on Monday?"),"requestId",UUID.randomUUID(),"assisted",false))).andExpect(status().isOk()).andExpect(jsonPath("$.score").isEmpty()).andExpect(jsonPath("$.passed").value(false));
    }
    @Test void notebookDuplicatesAreMeaningAwareAndDisabledCardsCannotBeReviewed() throws Exception {
        var item=new LinkedHashMap<String,Object>(Map.of("expression","bank","meaning","ngân hàng","reviewEnabled",true));
        String id=json(call(body(post("/api/v1/learning-items"),item)).andExpect(status().isCreated())).path("id").asText();
        call(body(post("/api/v1/learning-items"),item)).andExpect(status().isConflict());item.put("meaning","bờ sông");call(body(post("/api/v1/learning-items"),item)).andExpect(status().isCreated());
        UUID card=db.queryForObject("select id from review_cards where learning_item_id=?",UUID.class,UUID.fromString(id));
        item.put("meaning","ngân hàng");item.put("reviewEnabled",false);call(body(put("/api/v1/learning-items/"+id),item)).andExpect(status().isOk());
        call(body(post("/api/v1/review-cards/"+card+"/reviews"),Map.of("requestId",UUID.randomUUID(),"rating","GOOD","version",0))).andExpect(status().isNotFound());
    }
    @Test void sessionsAreIdempotentVersionedAndSplitAtLocalMidnight() throws Exception {
        UUID request=UUID.randomUUID();var session=study.start(owner,new StudyService.Start(request,20));assertThat(study.start(owner,new StudyService.Start(request,20))).isEqualTo(session);
        assertThatThrownBy(()->study.start(owner,new StudyService.Start(UUID.randomUUID(),5))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        clock.now=clock.now.plusSeconds(20);var result=study.update(owner,session.id(),new StudyService.Update(20,0,false));assertThat(result.version()).isEqualTo(1);
        assertThat(study.update(owner,session.id(),new StudyService.Update(20,0,false))).isEqualTo(result);
        call(get("/api/v1/dashboard")).andExpect(status().isOk()).andExpect(jsonPath("$.activeMinutesToday").value(10.0/60));
        assertThat(db.queryForObject("select count(*) from study_activity where session_id=?",Integer.class,session.id())).isEqualTo(2);
        assertThatThrownBy(()->study.update(owner,session.id(),new StudyService.Update(1000,1,false))).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        study.update(owner,session.id(),new StudyService.Update(20,1,true));assertThat(study.current(owner)).isNull();
    }
    @Test void sessionApiRejectsForeignIdsAndInvalidDurations() throws Exception {
        call(body(post("/api/v1/study-sessions"),Map.of("requestId",UUID.randomUUID(),"plannedMinutes",15))).andExpect(status().isBadRequest());
        call(body(put("/api/v1/study-sessions/"+UUID.randomUUID()),Map.of("activeSeconds",0,"version",0,"completed",true))).andExpect(status().isNotFound());
        call(get("/api/v1/study-sessions/current")).andExpect(status().isNoContent());
    }
    @Test void backupRoundTripKeepsHistoryScheduleDraftsAndBudget() throws Exception {
        UUID lesson=firstLesson();call(body(put("/api/v1/lessons/"+lesson+"/draft"),Map.of("answers",Map.of("q1","is")))).andExpect(status().isOk());
        call(body(post("/api/v1/learning-items"),Map.of("expression","look forward to","meaning","mong chờ","reviewEnabled",true))).andExpect(status().isCreated());
        var session=study.start(owner,new StudyService.Start(UUID.randomUUID(),5));clock.now=clock.now.plusSeconds(15);study.update(owner,session.id(),new StudyService.Update(15,0,true));
        db.update("insert into ai_daily_budgets(owner_id,budget_date,requests,tokens,estimated_cost) values(?,?,2,100,0.05)",owner,LocalDate.now(clock));
        JsonNode data=mapper.valueToTree(backup.export(owner));assertThat(data.toString()).doesNotContain("password_hash","api-key");
        call(body(post("/api/v1/data-import"),data)).andExpect(status().isConflict());
        backup.clear(owner);call(body(post("/api/v1/data-import"),data)).andExpect(status().isOk());
        call(get("/api/v1/learning-items")).andExpect(jsonPath("$.length()").value(1));
        call(get("/api/v1/lessons/"+lesson)).andExpect(jsonPath("$.draftAnswers.q1").value("is"));
        assertThat(db.queryForObject("select tokens from ai_daily_budgets where owner_id=?",Long.class,owner)).isEqualTo(100L);
        assertThat(mapper.valueToTree(backup.export(owner)).path("reviewCards")).isEqualTo(data.path("reviewCards"));
    }
    @Test void malformedBackupRollsBackAndCannotAttachToAnotherOwnersConversation() throws Exception {
        var data=mapper.valueToTree(backup.export(owner));UUID other=UUID.randomUUID(),conversation=UUID.randomUUID();
        db.update("insert into accounts(id,email,password_hash,display_name) values(?,?,'unused','Other')",other,other+"@example.com");
        db.update("insert into conversations(id,owner_id,title,created_at) values(?,?,'Other',?)",conversation,other,OffsetDateTime.now(clock));
        ((com.fasterxml.jackson.databind.node.ArrayNode)data.path("messages")).add(mapper.valueToTree(Map.of("id",UUID.randomUUID(),"conversationId",conversation,"role","user","content","injected","createdAt",clock.instant())));
        call(body(post("/api/v1/data-import"),data)).andExpect(status().isBadRequest());
        assertThat(db.queryForObject("select count(*) from messages where conversation_id=?",Long.class,conversation)).isZero();
    }
}
