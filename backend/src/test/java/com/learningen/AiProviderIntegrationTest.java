package com.learningen;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.*;
import java.util.concurrent.atomic.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(properties="spring.datasource.url=jdbc:h2:mem:ai-provider;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1") @ActiveProfiles("test")
class AiProviderIntegrationTest {
    @Autowired JdbcTemplate db;@Autowired TransactionTemplate tx;@Autowired Json json;@Autowired ObjectMapper mapper;@Autowired Clock clock;
    HttpServer server;UUID owner;MockEnvironment env;AtomicInteger calls;AtomicReference<String> payload;AtomicInteger upstreamStatus;AtomicReference<String> upstreamBody;
    @BeforeEach void setup() throws Exception {
        owner=UUID.randomUUID();db.update("insert into accounts(id,email,password_hash,display_name) values(?,?,'unused','AI tester')",owner,owner+"@example.com");
        calls=new AtomicInteger();payload=new AtomicReference<>();upstreamStatus=new AtomicInteger(200);upstreamBody=new AtomicReference<>("{\"choices\":[{\"message\":{\"content\":\"Xin chào — Hello.\"}}],\"usage\":{\"prompt_tokens\":100,\"completion_tokens\":30}}");
        server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);server.createContext("/v1/chat/completions",exchange->{
            calls.incrementAndGet();payload.set(new String(exchange.getRequestBody().readAllBytes(),StandardCharsets.UTF_8));
            byte[] response=upstreamBody.get().getBytes(StandardCharsets.UTF_8);exchange.getResponseHeaders().add("Content-Type","application/json");exchange.sendResponseHeaders(upstreamStatus.get(),response.length);exchange.getResponseBody().write(response);exchange.close();
        });server.start();
        env=new MockEnvironment().withProperty("app.ai.base-url","http://127.0.0.1:"+server.getAddress().getPort()+"/v1").withProperty("app.ai.api-key","test-only").withProperty("app.ai.model","test-model").withProperty("app.ai.max-output-tokens","1000").withProperty("app.ai.max-input-tokens","12000").withProperty("app.ai.daily-requests","30").withProperty("app.ai.daily-tokens","50000").withProperty("app.ai.global-daily-tokens","10000000").withProperty("app.ai.input-cost-per-million","1").withProperty("app.ai.output-cost-per-million","2").withProperty("app.ai.cost-tracking-enabled","true").withProperty("app.ai.daily-cost-limit","1").withProperty("app.ai.global-daily-cost-limit","100").withProperty("app.ai.timeout-seconds","5");
    }
    @AfterEach void stop() { if(server!=null)server.stop(0); }
    private AiService service() { return new AiService(db,tx,json,mapper,env,clock); }
    private AiService.Input input(UUID id) { return new AiService.Input("Hello",AiService.Mode.TRANSLATE,"First meeting",id,null); }
    private void rejects(HttpStatus status,Runnable call) { assertThatThrownBy(call::run).isInstanceOfSatisfying(ResponseStatusException.class,e->assertThat(e.getStatusCode()).isEqualTo(status)); }
    @Test void successfulRequestReplaysWithoutSecondCallAndStoresUsage() throws Exception {
        UUID id=UUID.randomUUID();Object result=service().send(owner,input(id),null,false);Object repeated=service().send(owner,input(id),null,false);
        assertThat(mapper.<com.fasterxml.jackson.databind.JsonNode>valueToTree(repeated)).isEqualTo(mapper.valueToTree(result));assertThat(calls.get()).isEqualTo(1);
        assertThat(db.queryForObject("select count(*) from messages m join conversations c on c.id=m.conversation_id where c.owner_id=?",Integer.class,owner)).isEqualTo(2);
        assertThat(db.queryForObject("select tokens from ai_daily_budgets where owner_id=?",Long.class,owner)).isEqualTo(130);
        assertThat(db.queryForObject("select estimated_cost from ai_daily_budgets where owner_id=?",java.math.BigDecimal.class,owner)).isEqualByComparingTo("0.00016");
        rejects(HttpStatus.CONFLICT,()->service().send(owner,new AiService.Input("Different",AiService.Mode.AUTO,"",id,null),null,false));assertThat(calls.get()).isEqualTo(1);
    }
    @Test void followUpUsesOwnedHistoryAndRejectsForeignConversation() throws Exception {
        var result=mapper.valueToTree(service().send(owner,input(UUID.randomUUID()),null,false));UUID conversation=UUID.fromString(result.path("conversationId").asText());
        service().send(owner,new AiService.Input("Why?",AiService.Mode.EXPLAIN,"",UUID.randomUUID(),conversation),conversation,false);
        assertThat(mapper.readTree(payload.get()).path("messages").size()).isEqualTo(4);
        UUID stranger=UUID.randomUUID();db.update("insert into accounts(id,email,password_hash,display_name) values(?,?,'unused','Other')",stranger,stranger+"@example.com");
        rejects(HttpStatus.NOT_FOUND,()->service().send(stranger,input(UUID.randomUUID()),conversation,false));assertThat(calls.get()).isEqualTo(2);
    }
    @Test void privacyModeDoesNotStoreTextOrConversationAndPreventsResend() {
        db.update("update accounts set retain_history=false where id=?",owner);UUID id=UUID.randomUUID();
        service().send(owner,input(id),null,false);
        assertThat(db.queryForObject("select count(*) from conversations where owner_id=?",Long.class,owner)).isZero();
        assertThat(db.queryForObject("select response from ai_requests where owner_id=?",String.class,owner)).isNull();
        rejects(HttpStatus.CONFLICT,()->service().send(owner,input(id),null,false));assertThat(calls.get()).isEqualTo(1);
    }
    @Test void providerErrorsAndMalformedUsageStayChargedAndDoNotStoreChat() {
        upstreamStatus.set(503);UUID id=UUID.randomUUID();rejects(HttpStatus.BAD_GATEWAY,()->service().send(owner,input(id),null,false));
        rejects(HttpStatus.CONFLICT,()->service().send(owner,input(id),null,false));assertThat(calls.get()).isEqualTo(1);
        assertThat(db.queryForObject("select tokens from ai_daily_budgets where owner_id=?",Long.class,owner)).isEqualTo(13000);
        upstreamStatus.set(200);upstreamBody.set("{\"choices\":[{\"message\":{\"content\":\"Fake\"}}]}");rejects(HttpStatus.BAD_GATEWAY,()->service().send(owner,input(UUID.randomUUID()),null,false));
        assertThat(db.queryForObject("select count(*) from messages m join conversations c on c.id=m.conversation_id where c.owner_id=?",Long.class,owner)).isZero();
    }
    @Test void requestAndTokenAndMonetaryLimitsRejectBeforeProviderCall() {
        env.withProperty("app.ai.daily-requests","0");rejects(HttpStatus.TOO_MANY_REQUESTS,()->service().send(owner,input(UUID.randomUUID()),null,false));
        env.withProperty("app.ai.daily-requests","30").withProperty("app.ai.daily-tokens","100");rejects(HttpStatus.TOO_MANY_REQUESTS,()->service().send(owner,input(UUID.randomUUID()),null,false));
        env.withProperty("app.ai.daily-tokens","50000").withProperty("app.ai.daily-cost-limit","0.001");rejects(HttpStatus.TOO_MANY_REQUESTS,()->service().send(owner,input(UUID.randomUUID()),null,false));
        assertThat(calls.get()).isZero();
    }
    @Test void overlongHistoryAndMissingConfigurationFailBeforeCallingProvider() {
        env.withProperty("app.ai.max-input-tokens","50");rejects(HttpStatus.PAYLOAD_TOO_LARGE,()->service().send(owner,input(UUID.randomUUID()),null,false));
        env.withProperty("app.ai.api-key","");rejects(HttpStatus.SERVICE_UNAVAILABLE,()->service().send(owner,input(UUID.randomUUID()),null,false));assertThat(calls.get()).isZero();
    }
}
