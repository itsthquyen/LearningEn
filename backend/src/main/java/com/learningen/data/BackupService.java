package com.learningen.data;

import com.fasterxml.jackson.databind.JsonNode;
import com.learningen.Accounts;
import java.time.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BackupService {
    private record Section(String name,String table,String fields) {}
    // Only these server-defined tables and columns are used for export/import SQL.
    private static final List<Section> SECTIONS=List.of(
        new Section("learningItems","learning_items","id,expression,meaning,context,example,notes,tags,created_at,review_enabled"),
        new Section("reviewCards","review_cards","id,learning_item_id,due_at,version,repetitions,interval_days,ease"),
        new Section("reviews","reviews","id,card_id,request_id,rating,created_at,response"),
        new Section("conversations","conversations","id,title,created_at"),
        new Section("messages","messages","id,conversation_id,role,content,created_at"),
        new Section("lessonDrafts","lesson_drafts","lesson_id,answers,updated_at"),
        new Section("lessonAttempts","lesson_attempts","id,lesson_id,request_id,fingerprint,answers,score,passed,assisted,response,created_at"),
        new Section("studySessions","study_sessions","id,request_id,planned_minutes,active_seconds,status,version,created_at,updated_at"),
        new Section("studyActivity","study_activity","session_id,activity_date,active_seconds")
    );
    private final JdbcTemplate db;private final Accounts accounts;private final Clock clock;
    public BackupService(JdbcTemplate db,Accounts accounts,Clock clock) { this.db=db;this.accounts=accounts;this.clock=clock; }
    private String owned(Section section) {
        return switch(section.table()) {
            case "messages" -> "conversation_id in (select id from conversations where owner_id=?)";
            case "study_activity" -> "session_id in (select id from study_sessions where owner_id=?)";
            default -> "owner_id=?";
        };
    }
    @Transactional(readOnly=true,isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ) public Map<String,Object> export(UUID owner) {
        Map<String,Object> result=new LinkedHashMap<>();result.put("schemaVersion",1);result.put("exportedAt",clock.instant());result.put("profile",accounts.profile(owner));
        for(var section:SECTIONS) {
            var rows=db.queryForList("select "+section.fields()+" from "+section.table()+" where "+owned(section),owner);
            result.put(section.name(),rows.stream().map(row->{ Map<String,Object> converted=new LinkedHashMap<>();row.forEach((k,v)->converted.put(camel(k),v));return converted; }).toList());
        }
        result.put("aiUsage",db.queryForList("select request_id,status,created_at,input_tokens,output_tokens,estimated_cost from ai_requests where owner_id=?",owner).stream().map(row->{ Map<String,Object> converted=new LinkedHashMap<>();row.forEach((k,v)->converted.put(camel(k),v));return converted; }).toList());
        return result;
    }
    @Transactional public Map<String,Object> restore(UUID owner,JsonNode data) {
        if(!data.isObject() || data.path("schemaVersion").asInt(-1)!=1) throw invalid("Unsupported backup schema");
        lock(owner);
        for(var section:SECTIONS) if(db.queryForObject("select count(*) from "+section.table()+" where "+owned(section),Long.class,owner)>0) throw new ResponseStatusException(HttpStatus.CONFLICT,"Clear your personal workspace before restoring a backup");
        int total=0;
        for(var section:SECTIONS) {
            JsonNode rows=data.path(section.name());
            if(!rows.isArray() || rows.size()>10000) throw invalid("Invalid or oversized backup section: "+section.name());
            for(JsonNode row:rows) {
                List<String> columns=new ArrayList<>(List.of(section.fields().split(",")));List<Object> values=new ArrayList<>();
                for(String column:columns) values.add(value(row,column));
                verifyRelationships(owner,section,row);
                if(!Set.of("messages","study_activity").contains(section.table())) { columns.add("owner_id");values.add(owner); }
                db.update("insert into "+section.table()+"("+String.join(",",columns)+") values("+String.join(",",Collections.nCopies(values.size(),"?"))+")",values.toArray());total++;
            }
        }
        // Usage is an archive; budget counters are deliberately never imported or reset.
        JsonNode usage=data.path("aiUsage");
        if(!usage.isArray() || usage.size()>10000) throw invalid("Invalid usage section");
        for(JsonNode row:usage) db.update("insert into ai_requests(id,owner_id,request_id,fingerprint,status,created_at,reserved_tokens,input_tokens,output_tokens,estimated_cost) values(?,?,?,'restored','ARCHIVED',?,0,?,?,?)",UUID.randomUUID(),owner,value(row,"request_id"),value(row,"created_at"),value(row,"input_tokens"),value(row,"output_tokens"),value(row,"estimated_cost"));
        JsonNode profile=data.path("profile");String name=profile.path("displayName").asText("").trim(),zone=profile.path("timeZone").asText("");
        int minutes=profile.path("dailyMinutes").asInt(-1);
        if(name.isBlank() || name.length()>100 || minutes<1 || minutes>480 || !profile.path("retainHistory").isBoolean()) throw invalid("Invalid backup profile");
        try { ZoneId.of(zone); } catch(DateTimeException e) { throw invalid("Invalid backup time zone"); }
        db.update("update accounts set display_name=?,daily_minutes=?,time_zone=?,retain_history=? where id=?",name,minutes,zone,profile.path("retainHistory").booleanValue(),owner);
        return Map.of("restoredRecords",total,"profile",accounts.profile(owner));
    }
    private void verifyRelationships(UUID owner,Section section,JsonNode row) {
        Map<String,String> relations=Map.of("learning_item_id","learning_items","card_id","review_cards","conversation_id","conversations","session_id","study_sessions","lesson_id","lessons");
        for(var entry:relations.entrySet()) if(row.has(camel(entry.getKey()))) {
            Object id=value(row,entry.getKey());boolean shared=entry.getValue().equals("lessons");
            Long count=shared?db.queryForObject("select count(*) from lessons where id=?",Long.class,id):db.queryForObject("select count(*) from "+entry.getValue()+" where id=? and owner_id=?",Long.class,id,owner);
            if(count!=1) throw invalid("Backup contains an invalid relationship");
        }
        if(section.table().equals("study_sessions") && !Set.of(5,20,30).contains(row.path("plannedMinutes").asInt())) throw invalid("Invalid study duration");
        if(section.table().equals("messages") && !Set.of("user","assistant").contains(row.path("role").asText())) throw invalid("Invalid message role");
        if(section.table().equals("reviews") && !Set.of("AGAIN","HARD","GOOD","EASY").contains(row.path("rating").asText())) throw invalid("Invalid review rating");
    }
    private Object value(JsonNode row,String column) {
        JsonNode v=row.get(camel(column));
        if(v==null || v.isNull()) { if(column.equals("score")) return null;throw invalid("Missing backup field: "+camel(column)); }
        try {
            if(column.equals("id") || column.endsWith("_id")) return UUID.fromString(v.asText());
            if(column.endsWith("_at")) return OffsetDateTime.parse(v.asText());
            if(column.equals("activity_date")) return LocalDate.parse(v.asText());
            if(Set.of("review_enabled","passed","assisted").contains(column)) { if(!v.isBoolean()) throw invalid("Invalid boolean");return v.booleanValue(); }
            if(Set.of("score","version","repetitions","interval_days","planned_minutes","active_seconds","input_tokens","output_tokens").contains(column)) {
                if(!v.isIntegralNumber() || !v.canConvertToLong() || v.longValue()<0 || v.longValue()>100000000) throw invalid("Invalid backup number");
                if(column.equals("score") && v.intValue()>100) throw invalid("Invalid score");
                if(column.equals("active_seconds") && v.intValue()>28800) throw invalid("Invalid active time");
                return v.longValue();
            }
            if(column.equals("ease") || column.equals("estimated_cost")) { if(!v.isNumber() || v.doubleValue()<0 || v.doubleValue()>1000000) throw invalid("Invalid decimal");return v.decimalValue(); }
            if(!v.isTextual() || v.textValue().length()>100000) throw invalid("Invalid backup text");return v.textValue();
        } catch(java.time.DateTimeException | IllegalArgumentException e) { throw invalid("Invalid backup field: "+camel(column)); }
    }
    private String camel(String name) { StringBuilder result=new StringBuilder();boolean upper=false;for(char c:name.toLowerCase(Locale.ROOT).toCharArray()) { if(c=='_') upper=true;else { result.append(upper?Character.toUpperCase(c):c);upper=false; } }return result.toString(); }
    private void lock(UUID owner) { db.queryForObject("select id from ai_budget_lock where id=1 for update",Integer.class);db.queryForObject("select id from accounts where id=? for update",UUID.class,owner); }
    @Transactional public void clear(UUID owner) {
        lock(owner);
        db.update("delete from ai_requests where owner_id=?",owner);db.update("delete from conversations where owner_id=?",owner);
        db.update("delete from learning_items where owner_id=?",owner);db.update("delete from lesson_attempts where owner_id=?",owner);
        db.update("delete from lesson_drafts where owner_id=?",owner);db.update("delete from study_sessions where owner_id=?",owner);
    }
    private static ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST,message); }
}
