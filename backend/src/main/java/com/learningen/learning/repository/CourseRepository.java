package com.learningen.learning.repository;

import com.learningen.learning.dto.LearningDtos.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CourseRepository {
    private final JdbcTemplate db;
    public CourseRepository(JdbcTemplate db) { this.db=db; }
    public List<Course> courses(UUID owner) {
        return db.query("select c.*, (select count(*) from lessons l where l.course_id=c.id) lesson_count, (select count(distinct a.lesson_id) from lesson_attempts a join lessons l on l.id=a.lesson_id where l.course_id=c.id and a.owner_id=? and a.passed=true and a.assisted=false) completed_count from courses c order by c.code",
            (r,n)->new Course(r.getObject("id",UUID.class),r.getString("title"),r.getString("level"),r.getString("description"),r.getString("content_status"),r.getLong("lesson_count"),r.getLong("completed_count")),owner);
    }
    public Map<String,Object> row(UUID lesson) {
        return db.queryForList("select * from lessons where id=?",lesson).stream().findFirst().orElse(null);
    }
    public List<Lesson> lessons(UUID owner, UUID course) {
        return db.query("select l.*, (select max(a.score) from lesson_attempts a where a.lesson_id=l.id and a.owner_id=? and a.assisted=false) best_score, (select count(*) from lesson_attempts a where a.lesson_id=l.id and a.owner_id=?) attempts, (select count(*) from lesson_attempts a where a.lesson_id=l.id and a.owner_id=? and a.passed=true and a.assisted=false) passes, (select count(*) from lesson_drafts d where d.lesson_id=l.id and d.owner_id=?) drafts from lessons l where l.course_id=? order by l.position",
            (r,n)->new Lesson(r.getObject("id",UUID.class),r.getObject("course_id",UUID.class),r.getString("title"),r.getString("objective"),r.getInt("position"),r.getString("kind"),r.getString("content_status"),r.getLong("passes")>0?"PASSED":r.getLong("attempts")>0?"PRACTICED":r.getLong("drafts")>0?"IN_PROGRESS":"NOT_STARTED",(Integer)r.getObject("best_score")),owner,owner,owner,owner,course);
    }
    public void lockOwner(UUID owner) { db.queryForObject("select id from accounts where id=? for update",UUID.class,owner); }
    public List<Map<String,Object>> previous(UUID owner, UUID request) { return db.queryForList("select * from lesson_attempts where owner_id=? and request_id=?",owner,request); }
    public String draft(UUID owner, UUID lesson) { return db.query("select answers from lesson_drafts where owner_id=? and lesson_id=?",(r,n)->r.getString(1),owner,lesson).stream().findFirst().orElse("{}"); }
    public void saveDraft(UUID owner, UUID lesson, String answers, java.time.OffsetDateTime now) {
        if(db.update("update lesson_drafts set answers=?,updated_at=? where owner_id=? and lesson_id=?",answers,now,owner,lesson)==0)
            db.update("insert into lesson_drafts(owner_id,lesson_id,answers,updated_at) values(?,?,?,?)",owner,lesson,answers,now);
    }
    public void saveResult(UUID owner, UUID lesson, UUID request, String fingerprint, String answers, Result result, String response) {
        db.update("insert into lesson_attempts(id,owner_id,lesson_id,request_id,fingerprint,answers,score,passed,assisted,response,created_at) values(?,?,?,?,?,?,?,?,?,?,?)",result.id(),owner,lesson,request,fingerprint,answers,result.score(),result.passed(),result.assisted(),response,java.time.OffsetDateTime.ofInstant(result.createdAt(),java.time.ZoneOffset.UTC));
        db.update("delete from lesson_drafts where owner_id=? and lesson_id=?",owner,lesson);
    }
}
