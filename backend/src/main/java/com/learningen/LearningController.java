package com.learningen;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/learning-items")
public class LearningController {
    private final JdbcTemplate db; private final Accounts accounts;
    public LearningController(JdbcTemplate db, Accounts accounts) { this.db = db; this.accounts = accounts; }
    public record Item(UUID id, String expression, String meaning, String context, String example, String notes, String tags, Instant createdAt, boolean reviewEnabled) {}
    public record Input(@NotBlank @Size(max=500) String expression, @NotBlank @Size(max=2000) String meaning,
        @Size(max=4000) String context, @Size(max=4000) String example, @Size(max=8000) String notes, @Size(max=1000) String tags, @NotNull Boolean reviewEnabled) {}
    static Item map(ResultSet rs, int n) throws SQLException {
        return new Item(rs.getObject("id", UUID.class), rs.getString("expression"), rs.getString("meaning"), rs.getString("context"), rs.getString("example"), rs.getString("notes"), rs.getString("tags"), rs.getTimestamp("created_at").toInstant(), rs.getBoolean("review_enabled"));
    }
    @GetMapping public List<Item> list(Authentication auth, @RequestParam(defaultValue="") @Size(max=500) String q) {
        if (q.length() > 500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search is too long");
        return db.query("select * from learning_items where owner_id=? and (position(? in lower(expression))>0 or position(? in lower(meaning))>0) order by created_at desc", LearningController::map, accounts.owner(auth), q.toLowerCase(Locale.ROOT), q.toLowerCase(Locale.ROOT));
    }
    private static String text(String value) { return value == null ? "" : value; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
    public Item create(Authentication auth, @Valid @RequestBody Input body) {
        UUID owner = accounts.owner(auth), id = UUID.randomUUID();
        db.update("insert into learning_items(id,owner_id,expression,meaning,context,example,notes,tags,created_at,review_enabled) values(?,?,?,?,?,?,?,?,?,?)", id, owner, body.expression().trim(), body.meaning().trim(), text(body.context()), text(body.example()), text(body.notes()), text(body.tags()), OffsetDateTime.now(ZoneOffset.UTC), body.reviewEnabled());
        syncCard(owner, id, body.reviewEnabled()); return get(owner, id);
    }
    @PutMapping("/{id}") @Transactional public Item update(Authentication auth, @PathVariable UUID id, @Valid @RequestBody Input body) {
        UUID owner = accounts.owner(auth);
        if (db.update("update learning_items set expression=?,meaning=?,context=?,example=?,notes=?,tags=?,review_enabled=? where id=? and owner_id=?", body.expression().trim(), body.meaning().trim(), text(body.context()), text(body.example()), text(body.notes()), text(body.tags()), body.reviewEnabled(), id, owner) != 1) throw missing();
        syncCard(owner, id, body.reviewEnabled()); return get(owner, id);
    }
    private void syncCard(UUID owner, UUID item, boolean enabled) {
        if (enabled && db.queryForObject("select count(*) from review_cards where learning_item_id=? and owner_id=?", Long.class, item, owner) == 0)
            db.update("insert into review_cards(id,owner_id,learning_item_id,due_at) values(?,?,?,?)", UUID.randomUUID(), owner, item, OffsetDateTime.now(ZoneOffset.UTC));
    }
    private Item get(UUID owner, UUID id) { return db.query("select * from learning_items where id=? and owner_id=?", LearningController::map, id, owner).stream().findFirst().orElseThrow(LearningController::missing); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication auth, @PathVariable UUID id) {
        if (db.update("delete from learning_items where id=? and owner_id=?", id, accounts.owner(auth)) != 1) throw missing();
    }
    static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"); }
}
