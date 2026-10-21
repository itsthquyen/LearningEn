package com.learningen.data;

import com.learningen.Accounts;
import com.learningen.learning.service.CourseService;
import java.time.*;
import java.util.*;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final JdbcTemplate db;private final Accounts accounts;private final CourseService courses;private final Clock clock;private final Environment env;
    public DashboardService(JdbcTemplate db,Accounts accounts,CourseService courses,Clock clock,Environment env) { this.db=db;this.accounts=accounts;this.courses=courses;this.clock=clock;this.env=env; }
    public Map<String,Object> dashboard(UUID owner) {
        Map<String,Object> result=new LinkedHashMap<>();
        result.put("notebookCount",count("select count(*) from learning_items where owner_id=?",owner));
        result.put("dueCount",db.queryForObject("select count(*) from review_cards c join learning_items i on i.id=c.learning_item_id where c.owner_id=? and i.owner_id=? and i.review_enabled=true and c.due_at<=?",Long.class,owner,owner,OffsetDateTime.now(clock)));
        long reviews=count("select count(*) from reviews where owner_id=?",owner);
        result.put("reviewCount",reviews);
        long remembered=count("select count(*) from reviews where owner_id=? and rating<>'AGAIN'",owner);
        result.put("retentionRate",reviews==0?null:(double)remembered/reviews);
        Map<String,Object> profile=accounts.profile(owner);result.put("dailyMinutes",profile.get("dailyMinutes"));
        ZoneId zone=ZoneId.of((String)profile.get("timeZone"));LocalDate today=LocalDate.now(clock.withZone(zone));
        List<Map<String,Object>> weekly=new ArrayList<>(),learning=new ArrayList<>();
        for(int i=6;i>=0;i--) {
            LocalDate date=today.minusDays(i);OffsetDateTime from=date.atStartOfDay(zone).toOffsetDateTime(),to=date.plusDays(1).atStartOfDay(zone).toOffsetDateTime();
            long n=db.queryForObject("select count(*) from reviews where owner_id=? and created_at>=? and created_at<?",Long.class,owner,from,to);
            weekly.add(Map.of("date",date,"reviews",n));
            long attempts=db.queryForObject("select count(*) from lesson_attempts where owner_id=? and created_at>=? and created_at<?",Long.class,owner,from,to);
            learning.add(Map.of("date",date,"activeMinutes",activeMinutes(owner,date),"attempts",attempts));
        }
        result.put("weeklyActivity",weekly);result.put("weeklyLearning",learning);result.put("activeMinutesToday",activeMinutes(owner,today));
        result.put("completedLessons",count("select count(distinct lesson_id) from lesson_attempts where owner_id=? and passed=true and assisted=false",owner));
        result.put("nextLesson",courses.courses(owner).stream().flatMap(c->courses.lessons(owner,c.id()).stream()).filter(l->!l.status().equals("PASSED")).findFirst().orElse(null));
        result.put("aiUsage",db.queryForObject("select count(*) requests,coalesce(sum(input_tokens),0) input_tokens,coalesce(sum(output_tokens),0) output_tokens,coalesce(sum(estimated_cost),0) estimated_cost from ai_requests where owner_id=?",(r,n)->Map.of("requests",r.getLong("requests"),"inputTokens",r.getLong("input_tokens"),"outputTokens",r.getLong("output_tokens"),"estimatedCost",r.getBigDecimal("estimated_cost")),owner));
        result.put("aiCostTrackingEnabled",env.getProperty("app.ai.cost-tracking-enabled",Boolean.class,false));
        return result;
    }
    private double activeMinutes(UUID owner,LocalDate date) { return db.queryForObject("select coalesce(sum(a.active_seconds),0) from study_activity a join study_sessions s on s.id=a.session_id where s.owner_id=? and a.activity_date=?",Long.class,owner,date)/60.0; }
    private long count(String sql,UUID owner) { return db.queryForObject(sql,Long.class,owner); }
}
