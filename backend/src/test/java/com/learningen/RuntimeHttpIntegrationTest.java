package com.learningen;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.datasource.url=jdbc:h2:mem:runtime-http;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
    "app.ai.base-url=", "app.ai.api-key=", "app.ai.model="
})
@ActiveProfiles("test")
class RuntimeHttpIntegrationTest {
    @LocalServerPort int port;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate db;
    @Autowired PasswordEncoder encoder;
    String email;
    String password;

    @BeforeEach void createIsolatedAccount() {
        email = UUID.randomUUID() + "@example.com";
        password = UUID.randomUUID().toString();
        db.update("insert into accounts(id,email,password_hash,display_name) values(?,?,?,?)",
            UUID.randomUUID(), email, encoder.encode(password), "HTTP test");
    }

    private final class Browser {
        final CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        final HttpClient client = HttpClient.newBuilder().cookieHandler(cookies)
            .connectTimeout(Duration.ofSeconds(10)).build();

        HttpResponse<String> send(String method, String path, Object input, boolean withCsrf) throws Exception {
            var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1" + path))
                .timeout(Duration.ofSeconds(20)).header("Accept", "application/json");
            if (withCsrf) {
                String token = cookies.getCookieStore().getCookies().stream()
                    .filter(c -> c.getName().equals("XSRF-TOKEN") && !c.hasExpired())
                    .findFirst().orElseThrow().getValue();
                builder.header("X-XSRF-TOKEN", token);
            }
            var body = input == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(input));
            if (input != null) builder.header("Content-Type", "application/json");
            return client.send(builder.method(method, body).build(), HttpResponse.BodyHandlers.ofString());
        }

        JsonNode call(String method, String path, Object input, int expected) throws Exception {
            var response = send(method, path, input, !method.equals("GET"));
            assertThat(response.statusCode()).as("%s %s: %s", method, path, response.body()).isEqualTo(expected);
            return response.body().isBlank() ? mapper.nullNode() : mapper.readTree(response.body());
        }

        void login(String account, String secret) throws Exception {
            call("GET", "/auth/csrf", null, 200);
            call("POST", "/auth/login", Map.of("email", account, "password", secret), 200);
            call("GET", "/auth/me", null, 200);
        }
    }

    @Test void realCookiesCsrfAndLogoutProtectTheSession() throws Exception {
        var browser = new Browser();
        browser.call("GET", "/auth/me", null, 401);
        assertThat(browser.send("POST", "/auth/login", Map.of("email", email, "password", password), false).statusCode()).isEqualTo(403);
        browser.login(email, password);
        assertThat(browser.send("PATCH", "/profile", Map.of(), false).statusCode()).isEqualTo(403);
        browser.call("POST", "/auth/logout", null, 204);
        browser.call("GET", "/auth/me", null, 401);
    }

    @Test void frameworkHttpErrorsKeepTheirStatusAndProblemDetailFormat() throws Exception {
        var browser = new Browser();
        browser.login(email, password);
        var wrongMethod = browser.call("POST", "/dashboard", Map.of(), 405);
        assertThat(wrongMethod.path("status").asInt()).isEqualTo(405);
        var invalidId = browser.call("GET", "/learning-items/not-a-uuid", null, 400);
        assertThat(invalidId.path("status").asInt()).isEqualTo(400);
    }

    @Test void notebookReviewLessonsSessionsAndBackupRoundTripOverHttp() throws Exception {
        var browser = new Browser();
        browser.login(email, password);
        var input = Map.of("expression", "HTTP " + UUID.randomUUID(), "meaning", "saved meaning",
            "context", "network integration", "reviewEnabled", true);
        var item = browser.call("POST", "/learning-items", input, 201);
        String itemId = item.path("id").asText();
        browser.call("GET", "/learning-items/" + itemId, null, 200);
        browser.call("POST", "/learning-items", input, 409);
        var card = browser.call("GET", "/review-cards?due=true", null, 200).get(0);
        String cardPath = "/review-cards/" + card.path("id").asText() + "/reviews";
        var review = Map.of("requestId", UUID.randomUUID().toString(), "rating", "GOOD", "version", card.path("version").asInt());
        var reviewed = browser.call("POST", cardPath, review, 200);
        assertThat(browser.call("POST", cardPath, review, 200)).isEqualTo(reviewed);
        var courses = browser.call("GET", "/courses", null, 200);
        assertThat(courses.isArray()).isTrue();
        assertThat(courses.size()).isPositive();
        var lesson = browser.call("GET", "/courses/" + courses.get(0).path("id").asText() + "/lessons", null, 200).get(0);
        String lessonPath = "/lessons/" + lesson.path("id").asText();
        var detail = browser.call("GET", lessonPath, null, 200);
        assertThat(detail.path("status").asText()).isEqualTo("NOT_STARTED");
        var question = detail.path("questions").get(0);
        assertThat(question.has("answer")).isFalse();
        var answers = Map.of(question.path("id").asText(), question.path("options").get(0).asText());
        browser.call("PUT", lessonPath + "/draft", Map.of("answers", answers), 200);
        var session = browser.call("POST", "/study-sessions", Map.of("requestId", UUID.randomUUID().toString(), "plannedMinutes", 5), 200);
        browser.call("PUT", "/study-sessions/" + session.path("id").asText(),
            Map.of("activeSeconds", 0, "version", session.path("version").asInt(), "completed", true), 200);
        browser.call("GET", "/study-sessions/current", null, 204);
        var dashboard = browser.call("GET", "/dashboard", null, 200);
        assertThat(dashboard.path("notebookCount").asInt()).isEqualTo(1);
        assertThat(dashboard.path("completedLessons").asInt()).isZero();
        browser.call("POST", "/assistant-requests", Map.of("content", "Hello", "mode", "AUTO", "requestId", UUID.randomUUID().toString()), 503);
        var backup = browser.call("GET", "/data-export", null, 200);
        assertThat(backup.toString()).doesNotContain("password_hash", "api-key");
        browser.call("POST", "/data-import", backup, 409);
        browser.call("DELETE", "/personal-data", null, 204);
        assertThat(browser.call("GET", "/learning-items", null, 200).size()).isZero();
        browser.call("POST", "/data-import", backup, 200);
        var restored = browser.call("GET", "/data-export", null, 200);
        assertThat(restored.path("reviewCards")).isEqualTo(backup.path("reviewCards"));
        assertThat(browser.call("GET", lessonPath, null, 200).path("draftAnswers")).isEqualTo(mapper.valueToTree(answers));
    }

    @Test void twoIndependentBrowserSessionsCannotAccessEachOthersResources() throws Exception {
        var owner = new Browser();
        owner.login(email, password);
        var item = owner.call("POST", "/learning-items", Map.of("expression", "private", "meaning", "owner only", "reviewEnabled", true), 201);
        var card = owner.call("GET", "/review-cards", null, 200).get(0);
        var conversation = owner.call("POST", "/conversations", Map.of("title", "Private conversation"), 201);
        var session = owner.call("POST", "/study-sessions", Map.of("requestId", UUID.randomUUID().toString(), "plannedMinutes", 20), 200);
        createIsolatedAccount();
        var other = new Browser();
        other.login(email, password);
        assertThat(other.call("GET", "/learning-items", null, 200).size()).isZero();
        String itemPath = "/learning-items/" + item.path("id").asText();
        other.call("GET", itemPath, null, 404);
        other.call("PUT", itemPath, Map.of("expression", "changed", "meaning", "changed", "reviewEnabled", false), 404);
        other.call("DELETE", itemPath, null, 404);
        other.call("POST", "/review-cards/" + card.path("id").asText() + "/reviews",
            Map.of("requestId", UUID.randomUUID().toString(), "rating", "GOOD", "version", 0), 404);
        other.call("GET", "/conversations/" + conversation.path("id").asText() + "/messages", null, 404);
        other.call("DELETE", "/conversations/" + conversation.path("id").asText(), null, 404);
        other.call("PUT", "/study-sessions/" + session.path("id").asText(),
            Map.of("activeSeconds", 0, "version", 0, "completed", true), 404);
        owner.call("GET", itemPath, null, 200);
    }
}
