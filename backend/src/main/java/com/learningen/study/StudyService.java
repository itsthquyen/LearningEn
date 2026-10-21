package com.learningen.study;

import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudyService {
    public record Start(@NotNull UUID requestId,@NotNull Integer plannedMinutes) {}
    public record Update(@NotNull @Min(0) @Max(28800) Integer activeSeconds,@NotNull @Min(0) Integer version,@NotNull Boolean completed) {}
    public record Session(UUID id,int plannedMinutes,int activeSeconds,String status,int version) {}
    private final JdbcTemplate db;private final Clock clock;
    public StudyService(JdbcTemplate db,Clock clock) { this.db=db;this.clock=clock; }
    private Session map(Map<String,Object> row) { return new Session((UUID)row.get("id"),((Number)row.get("planned_minutes")).intValue(),((Number)row.get("active_seconds")).intValue(),(String)row.get("status"),((Number)row.get("version")).intValue()); }
    public Session current(UUID owner) { return db.queryForList("select * from study_sessions where owner_id=? and status='ACTIVE' order by created_at desc",owner).stream().findFirst().map(this::map).orElse(null); }
    @Transactional public Session start(UUID owner,Start input) {
        if(!Set.of(5,20,30).contains(input.plannedMinutes())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose a 5, 20 or 30 minute session");
        db.queryForObject("select id from accounts where id=? for update",UUID.class,owner);
        var previous=db.queryForList("select * from study_sessions where owner_id=? and request_id=?",owner,input.requestId());
        if(!previous.isEmpty()) {
            Session saved=map(previous.get(0));if(saved.plannedMinutes()!=input.plannedMinutes()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Request ID reused with different duration");return saved;
        }
        if(current(owner)!=null) throw new ResponseStatusException(HttpStatus.CONFLICT,"Continue or complete the active study session first");
        UUID id=UUID.randomUUID();OffsetDateTime now=OffsetDateTime.now(clock);
        db.update("insert into study_sessions(id,owner_id,request_id,planned_minutes,created_at,updated_at) values(?,?,?,?,?,?)",id,owner,input.requestId(),input.plannedMinutes(),now,now);
        return new Session(id,input.plannedMinutes(),0,"ACTIVE",0);
    }
    @Transactional public Session update(UUID owner,UUID id,Update input) {
        var rows=db.queryForList("select * from study_sessions where id=? and owner_id=? for update",id,owner);
        if(rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Study session not found");
        var row=rows.get(0);Session saved=map(row);
        // Safe replay after a lost response, without changing time or version twice.
        if(saved.version()==input.version()+1 && saved.activeSeconds()==input.activeSeconds() && saved.status().equals(input.completed()?"COMPLETED":"ACTIVE")) return saved;
        if(saved.version()!=input.version() || !saved.status().equals("ACTIVE")) throw new ResponseStatusException(HttpStatus.CONFLICT,"Study session changed; reload it");
        Instant last=((java.time.OffsetDateTime)row.get("updated_at")).toInstant();
        long elapsed=Math.max(0,Duration.between(last,clock.instant()).getSeconds());
        if(input.activeSeconds()<saved.activeSeconds() || input.activeSeconds()-saved.activeSeconds()>elapsed+5) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Active time must be monotonic and cannot exceed elapsed time");
        String state=input.completed()?"COMPLETED":"ACTIVE";
        ZoneId zone=ZoneId.of(db.queryForObject("select time_zone from accounts where id=?",String.class,owner));
        Instant end=clock.instant();int remaining=input.activeSeconds()-saved.activeSeconds();
        while(remaining>0) {
            LocalDate date=end.minusNanos(1).atZone(zone).toLocalDate();
            Instant dayStart=date.atStartOfDay(zone).toInstant();
            int seconds=(int)Math.min(remaining,Math.max(1,Duration.between(dayStart,end).getSeconds()));
            if(db.update("update study_activity set active_seconds=active_seconds+? where session_id=? and activity_date=?",seconds,id,date)==0)
                db.update("insert into study_activity(session_id,activity_date,active_seconds) values(?,?,?)",id,date,seconds);
            remaining-=seconds;end=end.minusSeconds(seconds);
        }
        db.update("update study_sessions set active_seconds=?,status=?,version=version+1,updated_at=? where id=? and owner_id=?",input.activeSeconds(),state,OffsetDateTime.now(clock),id,owner);
        return new Session(id,saved.plannedMinutes(),input.activeSeconds(),state,saved.version()+1);
    }
}
