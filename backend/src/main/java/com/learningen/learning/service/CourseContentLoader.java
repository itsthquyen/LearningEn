package com.learningen.learning.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningen.Json;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Versioned, original seed content. Draft content must be reviewed before release. */
@Component
public class CourseContentLoader implements ApplicationRunner {
    public record Seed(String code,String title,String level,String description,String contentStatus,int version,List<SeedLesson> lessons) {}
    public record SeedLesson(String code,String title,String objective,String kind,String body,List<CourseService.AnswerKey> questions) {}
    private final JdbcTemplate db;private final ObjectMapper mapper;private final Json json;private final Resource resource;
    public CourseContentLoader(JdbcTemplate db,ObjectMapper mapper,Json json,@Value("${app.learning.content:classpath:content/a1-foundations.json}") Resource resource) { this.db=db;this.mapper=mapper;this.json=json;this.resource=resource; }
    @Override @Transactional public void run(ApplicationArguments args) throws Exception {
        Seed seed;
        try(var stream=resource.getInputStream()) { seed=mapper.readValue(stream,Seed.class); }
        UUID course=id(seed.code());
        var versions=db.query("select content_version from courses where id=?",(r,n)->r.getInt(1),course);
        if(!versions.isEmpty() && versions.get(0)>=seed.version()) return;
        if(seed.lessons().isEmpty() || !Set.of("DRAFT","REVIEWED").contains(seed.contentStatus())) throw new IllegalStateException("Invalid course seed");
        if(versions.isEmpty()) db.update("insert into courses(id,code,title,level,description,content_status,content_version) values(?,?,?,?,?,?,?)",course,seed.code(),seed.title(),seed.level(),seed.description(),seed.contentStatus(),seed.version());
        else db.update("update courses set title=?,description=?,content_status=?,content_version=? where id=?",seed.title(),seed.description(),seed.contentStatus(),seed.version(),course);
        int position=0;
        for(var l:seed.lessons()) {
            if(l.questions().isEmpty() || !Set.of("LESSON","CHECKPOINT","APPLICATION").contains(l.kind())) throw new IllegalStateException("Invalid lesson seed");
            Set<String> ids=new HashSet<>();
            for(var q:l.questions()) {
                if(!ids.add(q.id()) || !Set.of("WRITING","MULTIPLE_CHOICE").contains(q.type()) || (q.type().equals("MULTIPLE_CHOICE") && !q.options().contains(q.answer()))) throw new IllegalStateException("Invalid question seed");
            }
            UUID lesson=id(seed.code()+":"+l.code());position++;
            int updated=db.update("update lessons set title=?,objective=?,position=?,kind=?,content_status=?,body=?,questions=? where id=?",l.title(),l.objective(),position,l.kind(),seed.contentStatus(),l.body(),json.write(l.questions()),lesson);
            if(updated==0) db.update("insert into lessons(id,course_id,code,title,objective,position,kind,content_status,body,questions) values(?,?,?,?,?,?,?,?,?,?)",lesson,course,l.code(),l.title(),l.objective(),position,l.kind(),seed.contentStatus(),l.body(),json.write(l.questions()));
        }
    }
    private UUID id(String value) { return UUID.nameUUIDFromBytes(value.getBytes(StandardCharsets.UTF_8)); }
}
