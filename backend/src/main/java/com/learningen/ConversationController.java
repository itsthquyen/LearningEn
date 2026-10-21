package com.learningen;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/conversations")
public class ConversationController {
    private final JdbcTemplate db; private final Accounts accounts; private final AiService ai;
    public ConversationController(JdbcTemplate db, Accounts accounts, AiService ai) { this.db=db; this.accounts=accounts; this.ai=ai; }
    public record Title(@NotBlank @Size(max=200) String title) {}
    static Map<String,Object> conversation(java.sql.ResultSet r, int n) throws java.sql.SQLException { return Map.of("id",r.getObject("id",UUID.class),"title",r.getString("title"),"createdAt",r.getTimestamp("created_at").toInstant()); }
    static Map<String,Object> message(java.sql.ResultSet r, int n) throws java.sql.SQLException { return Map.of("id",r.getObject("id",UUID.class),"role",r.getString("role"),"content",r.getString("content"),"createdAt",r.getTimestamp("created_at").toInstant()); }
    @GetMapping public List<Map<String,Object>> list(Authentication auth,@RequestParam(defaultValue="") String q) {
        if(q.length()>500) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Search is too long");
        String query=q.toLowerCase(Locale.ROOT);
        return db.query("select c.* from conversations c where c.owner_id=? and (position(? in lower(c.title))>0 or exists(select 1 from messages m where m.conversation_id=c.id and position(? in lower(m.content))>0)) order by c.created_at desc",ConversationController::conversation,accounts.owner(auth),query,query);
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> create(Authentication auth,@Valid @RequestBody Title title) {
        UUID id=UUID.randomUUID(),owner=accounts.owner(auth);
        db.update("insert into conversations(id,owner_id,title,created_at) values(?,?,?,?)",id,owner,title.title().trim(),OffsetDateTime.now(ZoneOffset.UTC));
        return db.queryForObject("select * from conversations where id=? and owner_id=?",ConversationController::conversation,id,owner);
    }
    @GetMapping("/{id}/messages") public List<Map<String,Object>> messages(Authentication auth,@PathVariable UUID id) {
        UUID owner=accounts.owner(auth); requireOwned(db,owner,id);
        return db.query("select m.* from messages m join conversations c on c.id=m.conversation_id where c.id=? and c.owner_id=? order by m.created_at,m.id",ConversationController::message,id,owner);
    }
    @PostMapping("/{id}/messages") public Object send(Authentication auth,@PathVariable UUID id,@Valid @RequestBody AiService.Input body) { return ai.send(accounts.owner(auth),body,id,true); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication auth,@PathVariable UUID id) {
        if(db.update("delete from conversations where id=? and owner_id=?",id,accounts.owner(auth))!=1) throw LearningController.missing();
    }
    static void requireOwned(JdbcTemplate db,UUID owner,UUID id) { if(db.queryForObject("select count(*) from conversations where id=? and owner_id=?",Long.class,id,owner)!=1) throw LearningController.missing(); }
}
