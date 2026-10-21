package com.learningen.learning.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningen.Json;
import com.learningen.learning.dto.LearningDtos.*;
import com.learningen.learning.repository.CourseRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CourseService {
    public record AnswerKey(String id,String prompt,List<String> options,String type,String answer,String explanation) {}
    private final CourseRepository repository;
    private final ObjectMapper mapper;
    private final Json json;
    private final Clock clock;
    private final int passScore;
    public CourseService(CourseRepository repository,ObjectMapper mapper,Json json,Clock clock,@Value("${app.learning.pass-score:80}") int passScore) {
        this.repository=repository;this.mapper=mapper;this.json=json;this.clock=clock;this.passScore=passScore;
    }
    public List<Course> courses(UUID owner) { return repository.courses(owner); }
    public List<Lesson> lessons(UUID owner, UUID course) {
        if(courses(owner).stream().noneMatch(c->c.id().equals(course))) throw missing();
        return repository.lessons(owner,course);
    }
    private Map<String,Object> require(UUID id) { var row=repository.row(id);if(row==null) throw missing();return row; }
    private List<AnswerKey> questions(Map<String,Object> row) {
        try { return mapper.readValue((String)row.get("questions"),new TypeReference<List<AnswerKey>>(){}); }
        catch(Exception e) { throw new IllegalStateException("Invalid course content"); }
    }
    public Detail detail(UUID owner, UUID id) {
        var row=require(id);
        Lesson l=repository.lessons(owner,(UUID)row.get("course_id")).stream().filter(x->x.id().equals(id)).findFirst().orElseThrow(CourseService::missing);
        Map<String,String> answers;
        try { answers=mapper.readValue(repository.draft(owner,id),new TypeReference<Map<String,String>>(){}); }
        catch(Exception e) { throw new IllegalStateException("Invalid draft"); }
        return new Detail(l.id(),l.courseId(),l.title(),l.objective(),l.position(),l.kind(),l.contentStatus(),l.status(),l.bestScore(),(String)row.get("body"),questions(row).stream().map(q->new Question(q.id(),q.prompt(),q.options(),q.type())).toList(),answers);
    }
    private void validate(List<AnswerKey> questions, Map<String,String> answers, boolean complete) {
        var ids=questions.stream().map(AnswerKey::id).toList();
        if(!ids.containsAll(answers.keySet()) || (complete && (answers.size()!=ids.size() || answers.values().stream().anyMatch(String::isBlank)))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Answer all questions using valid question IDs");
        for(var q:questions) {
            String answer=answers.get(q.id());
            if(answer!=null && !answer.isBlank() && q.type().equals("MULTIPLE_CHOICE") && !q.options().contains(answer)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid answer option");
        }
    }
    @Transactional public Detail draft(UUID owner,UUID id,Draft input) {
        var row=require(id); validate(questions(row),input.answers(),false);repository.lockOwner(owner);
        repository.saveDraft(owner,id,json.write(input.answers()),OffsetDateTime.now(clock));return detail(owner,id);
    }
    @Transactional public Object attempt(UUID owner,UUID id,Attempt input) {
        var row=require(id);var questions=questions(row);validate(questions,input.answers(),true);repository.lockOwner(owner);
        String fingerprint;
        try { fingerprint=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(json.write(List.of(id,new TreeMap<>(input.answers()),input.assisted())).getBytes(StandardCharsets.UTF_8))); }
        catch(Exception e) { throw new IllegalStateException(e); }
        var previous=repository.previous(owner,input.requestId());
        if(!previous.isEmpty()) {
            if(!previous.get(0).get("fingerprint").equals(fingerprint)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Request ID already used with different answers");
            return json.read((String)previous.get(0).get("response"));
        }
        List<Feedback> feedback=new ArrayList<>();int correct=0,graded=0;boolean hasWriting=false;
        for(var q:questions) {
            if(q.type().equals("WRITING")) { hasWriting=true;feedback.add(new Feedback(q.id(),null,q.answer(),q.explanation())); }
            else { graded++;boolean ok=q.answer().equals(input.answers().get(q.id()));if(ok)correct++;feedback.add(new Feedback(q.id(),ok,q.answer(),q.explanation())); }
        }
        Integer score=graded==0?null:(int)Math.round(100.0*correct/graded);
        boolean passed=!hasWriting && !input.assisted() && score!=null && score>=passScore;
        Result result=new Result(UUID.randomUUID(),id,score,passed,input.assisted(),feedback,clock.instant());
        repository.saveResult(owner,id,input.requestId(),fingerprint,json.write(input.answers()),result,json.write(result));return result;
    }
    private static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND,"Course or lesson not found"); }
}
