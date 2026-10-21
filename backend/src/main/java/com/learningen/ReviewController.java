package com.learningen;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.sql.*;
import java.time.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/review-cards")
public class ReviewController {
    private final JdbcTemplate db; private final Accounts accounts; private final Sm2Scheduler scheduler; private final Json json; private final Clock clock;
    public ReviewController(JdbcTemplate db, Accounts accounts, Sm2Scheduler scheduler, Json json, Clock clock) { this.db=db; this.accounts=accounts; this.scheduler=scheduler; this.json=json; this.clock=clock; }
    public record Card(UUID id, UUID learningItemId, String expression, String meaning, String context, String example, Instant dueAt, int version) {}
    public record Review(@NotNull UUID requestId, @NotNull Sm2Scheduler.Rating rating, @NotNull @Min(0) Integer version) {}
    private static final String SELECT = "select c.*,i.expression,i.meaning,i.context,i.example from review_cards c join learning_items i on i.id=c.learning_item_id where c.owner_id=? and i.owner_id=? and i.review_enabled=true";
    static Card map(ResultSet r, int n) throws SQLException { return new Card(r.getObject("id", UUID.class), r.getObject("learning_item_id", UUID.class), r.getString("expression"), r.getString("meaning"), r.getString("context"), r.getString("example"), r.getTimestamp("due_at").toInstant(), r.getInt("version")); }
    @GetMapping public List<Card> list(Authentication auth, @RequestParam(defaultValue="false") boolean due) {
        UUID owner=accounts.owner(auth);
        return due ? db.query(SELECT+" and c.due_at<=? order by c.due_at",ReviewController::map,owner,owner,OffsetDateTime.now(clock)) : db.query(SELECT+" order by c.due_at",ReviewController::map,owner,owner);
    }
    @PostMapping("/{id}/reviews") @Transactional public Object review(Authentication auth, @PathVariable UUID id, @Valid @RequestBody Review body) {
        UUID owner=accounts.owner(auth);
        // Serialize per owner so the idempotency key remains safe across different cards too.
        db.queryForObject("select id from accounts where id=? for update", UUID.class, owner);
        var previous=db.queryForList("select card_id,rating,response from reviews where owner_id=? and request_id=?", owner, body.requestId());
        if (!previous.isEmpty()) {
            var row=previous.get(0);
            Map<?,?> saved=(Map<?,?>)json.read((String)row.get("response"));
            if (!id.equals(row.get("card_id")) || !body.rating().name().equals(row.get("rating")) || ((Number)saved.get("version")).intValue()!=body.version()+1) throw new ResponseStatusException(HttpStatus.CONFLICT, "Request ID already used for another review");
            return json.read((String)row.get("response"));
        }
        var rows=db.queryForList("select c.* from review_cards c join learning_items i on i.id=c.learning_item_id where c.id=? and c.owner_id=? and i.owner_id=? and i.review_enabled=true for update", id,owner,owner);
        if(rows.isEmpty()) throw LearningController.missing();
        var row=rows.get(0);
        if (((Number)row.get("version")).intValue()!=body.version()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Review card changed; refresh before reviewing");
        var next=scheduler.next(((Number)row.get("repetitions")).intValue(), ((Number)row.get("interval_days")).intValue(), ((Number)row.get("ease")).doubleValue(),body.rating());
        ZoneId zone=ZoneId.of((String)accounts.profile(owner).get("timeZone"));
        db.update("update review_cards set repetitions=?,interval_days=?,ease=?,due_at=?,version=version+1 where id=? and owner_id=?", next.repetitions(),next.intervalDays(),next.ease(),ZonedDateTime.now(clock.withZone(zone)).plusDays(next.intervalDays()).toOffsetDateTime(),id,owner);
        Card card=db.queryForObject(SELECT+" and c.id=?",ReviewController::map,owner,owner,id);
        db.update("insert into reviews(id,owner_id,card_id,request_id,rating,created_at,response) values(?,?,?,?,?,?,?)",UUID.randomUUID(),owner,id,body.requestId(),body.rating().name(),OffsetDateTime.now(clock),json.write(card));
        return card;
    }
}
