package com.learningen;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/b1-exam")
public class B1ExamController {
    private final ObjectMapper mapper;
    private final JdbcTemplate db;
    private final Accounts accounts;

    public B1ExamController(ObjectMapper mapper, JdbcTemplate db, Accounts accounts) {
        this.mapper = mapper; this.db = db; this.accounts = accounts;
    }

    public JsonNode validateResponses(JsonNode responses) {
        if (responses == null || !responses.isObject() || responses.size() > 614 ||
                responses.toString().getBytes(StandardCharsets.UTF_8).length > 4_000_000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid draft responses");
        Map<String, JsonNode> questions = new HashMap<>();
        for (JsonNode section : exam().path("sections"))
            for (JsonNode group : section.path("groups"))
                for (JsonNode question : group.path("questions"))
                    questions.put(question.path("id").asText(), question);
        responses.fields().forEachRemaining(entry -> {
            JsonNode question = questions.get(entry.getKey()), value = entry.getValue();
            if (question == null || question.path("unavailable").asBoolean(false) || !value.isTextual() || value.textValue().length() > 4000)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid draft response");
            String type = question.path("type").asText();
            if (type.equals("choice") || type.equals("matching")) {
                boolean valid = false;
                for (JsonNode option : question.path("options")) if (value.textValue().equals(option.path("id").asText())) valid = true;
                if (!valid) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid draft option");
            } else if (!type.equals("writing") && !type.equals("speaking")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid draft question");
            }
        });
        return responses;
    }

    private Map<String, Object> draft(UUID owner) {
        return db.query("select responses,version from b1_exam_drafts where owner_id=?", (rs, n) -> {
            try { return Map.<String, Object>of("responses", mapper.readTree(rs.getString(1)), "version", rs.getInt(2)); }
            catch (IOException e) { throw new IllegalStateException("Invalid stored draft", e); }
        }, owner).stream().findFirst().orElseGet(() -> Map.of("responses", mapper.createObjectNode(), "version", 0));
    }

    @GetMapping("/draft")
    public Map<String, Object> getDraft(Authentication auth) { return draft(accounts.owner(auth)); }

    @PutMapping("/draft")
    @Transactional
    public Map<String, Object> putDraft(Authentication auth, @RequestBody JsonNode body) {
        UUID owner = accounts.owner(auth);
        if (!body.isObject() || body.size() != 2 || !body.has("responses") || !body.path("version").isIntegralNumber()
                || !body.path("version").canConvertToInt() || body.path("version").intValue() < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid draft");
        JsonNode responses = validateResponses(body.get("responses"));
        int version = body.path("version").intValue();
        db.queryForObject("select id from accounts where id=? for update", UUID.class, owner);
        Map<String, Object> current = draft(owner);
        int stored = (Integer) current.get("version");
        if (version != stored) {
            if (version == stored - 1 && responses.equals(current.get("responses"))) return current;
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Draft version conflict");
        }
        if (version == Integer.MAX_VALUE) throw new ResponseStatusException(HttpStatus.CONFLICT, "Draft version exhausted");
        if (stored == 0) db.update("insert into b1_exam_drafts(owner_id,responses,version,updated_at) values(?,?,?,CURRENT_TIMESTAMP)", owner, responses.toString(), 1);
        else db.update("update b1_exam_drafts set responses=?,version=?,updated_at=CURRENT_TIMESTAMP where owner_id=?", responses.toString(), stored + 1, owner);
        return Map.of("responses", responses, "version", stored + 1);
    }

    private JsonNode read(String name) {
        try (var input = new ClassPathResource("content/" + name).getInputStream()) {
            return mapper.readTree(input);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "B1 exam content is unavailable");
        }
    }

    @GetMapping
    public JsonNode exam() { return read("b1-exam.json"); }

    @GetMapping("/answers/{questionId}")
    public JsonNode answer(@PathVariable String questionId) {
        boolean permitted = false;
        for (JsonNode section : exam().path("sections")) {
            for (JsonNode group : section.path("groups")) {
                for (JsonNode question : group.path("questions")) {
                    if (questionId.equals(question.path("id").asText())) {
                        String type = section.path("kind").asText();
                        permitted = !"listening".equals(type) && !"unavailable".equals(question.path("type").asText())
                            && !question.path("unavailable").asBoolean(false);
                    }
                }
            }
        }
        if (!permitted) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Answer not available");
        JsonNode result = read("b1-exam-answers.json").get(questionId);
        if (result == null || result.isNull()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Answer not available");
        return result;
    }

    @GetMapping("/images/{name:.+}")
    public ResponseEntity<Resource> image(@PathVariable String name) {
        if (!name.matches("[A-Za-z0-9_-]+\\.(png|jpg|webp)")) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        Resource resource = new ClassPathResource("content/b1-exam-images/" + name);
        if (!resource.exists()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        MediaType type = switch (name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT)) {
            case "jpg" -> MediaType.IMAGE_JPEG;
            case "webp" -> MediaType.parseMediaType("image/webp");
            default -> MediaType.IMAGE_PNG;
        };
        return ResponseEntity.ok().contentType(type).body(resource);
    }
}
