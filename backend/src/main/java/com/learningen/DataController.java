package com.learningen;

import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1")
public class DataController {
    private final JdbcTemplate db; private final Accounts accounts;
    public DataController(JdbcTemplate db,Accounts accounts) { this.db=db;this.accounts=accounts; }
    @GetMapping("/dashboard") public Map<String,Object> dashboard(Authentication auth) {
        UUID owner=accounts.owner(auth);
        Map<String,Object> result=new LinkedHashMap<>();
        result.put("notebookCount",count("select count(*) from learning_items where owner_id=?",owner));
        result.put("dueCount",db.queryForObject("select count(*) from review_cards c join learning_items i on i.id=c.learning_item_id where c.owner_id=? and i.owner_id=? and i.review_enabled=true and c.due_at<=CURRENT_TIMESTAMP",Long.class,owner,owner));
        long reviews=count("select count(*) from reviews where owner_id=?",owner);
        result.put("reviewCount",reviews);
        long remembered=count("select count(*) from reviews where owner_id=? and rating<>'AGAIN'",owner);
        result.put("retentionRate",reviews==0?null:(double)remembered/reviews);
        Map<String,Object> profile=accounts.profile(owner);
        result.put("dailyMinutes",profile.get("dailyMinutes"));
        ZoneId zone=ZoneId.of((String)profile.get("timeZone"));
        LocalDate today=LocalDate.now(zone);
        List<Map<String,Object>> weekly=new ArrayList<>();
        for(int i=6;i>=0;i--) {
            LocalDate date=today.minusDays(i);
            long n=db.queryForObject("select count(*) from reviews where owner_id=? and created_at>=? and created_at<?",Long.class,owner,date.atStartOfDay(zone).toOffsetDateTime(),date.plusDays(1).atStartOfDay(zone).toOffsetDateTime());
            weekly.add(Map.of("date",date,"reviews",n));
        }
        result.put("weeklyActivity",weekly);
        result.put("aiUsage",db.queryForObject("select count(*) requests,coalesce(sum(input_tokens),0) input_tokens,coalesce(sum(output_tokens),0) output_tokens,coalesce(sum(estimated_cost),0) estimated_cost from ai_requests where owner_id=?",(r,n)->Map.of("requests",r.getLong("requests"),"inputTokens",r.getLong("input_tokens"),"outputTokens",r.getLong("output_tokens"),"estimatedCost",r.getBigDecimal("estimated_cost")),owner));
        return result;
    }
    private long count(String sql,UUID owner) { return db.queryForObject(sql,Long.class,owner); }
    @GetMapping("/data-export") @Transactional(readOnly=true)
    public Map<String,Object> export(Authentication auth) {
        UUID owner=accounts.owner(auth);
        Map<String,Object> result=new LinkedHashMap<>();
        result.put("exportedAt",Instant.now());result.put("profile",accounts.profile(owner));
        result.put("learningItems",db.query("select * from learning_items where owner_id=? order by created_at",LearningController::map,owner));
        result.put("reviewCards",db.queryForList("select * from review_cards where owner_id=?",owner));
        result.put("reviews",db.queryForList("select id,card_id,request_id,rating,created_at from reviews where owner_id=?",owner));
        result.put("conversations",db.query("select * from conversations where owner_id=?",ConversationController::conversation,owner));
        result.put("messages",db.query("select m.* from messages m join conversations c on c.id=m.conversation_id where c.owner_id=? order by m.created_at",ConversationController::message,owner));
        result.put("aiUsage",db.queryForList("select request_id,status,created_at,input_tokens,output_tokens,estimated_cost from ai_requests where owner_id=?",owner));
        return result;
    }
    @DeleteMapping("/personal-data") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
    public void clear(Authentication auth) {
        UUID owner=accounts.owner(auth);
        db.queryForObject("select id from ai_budget_lock where id=1 for update",Integer.class);
        db.queryForObject("select id from accounts where id=? for update",UUID.class,owner);
        db.update("delete from ai_requests where owner_id=?",owner);
        db.update("delete from conversations where owner_id=?",owner);
        db.update("delete from learning_items where owner_id=?",owner);
    }
}
