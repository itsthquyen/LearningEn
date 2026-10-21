package com.learningen.notebook;

import com.learningen.notebook.NotebookDtos.Input;
import com.learningen.notebook.NotebookDtos.Item;
import java.sql.*;
import java.time.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotebookService {
    private final JdbcTemplate db;private final Clock clock;
    public NotebookService(JdbcTemplate db,Clock clock) { this.db=db;this.clock=clock; }
    public static Item map(ResultSet rs,int n) throws SQLException { return new Item(rs.getObject("id",UUID.class),rs.getString("expression"),rs.getString("meaning"),rs.getString("context"),rs.getString("example"),rs.getString("notes"),rs.getString("tags"),rs.getTimestamp("created_at").toInstant(),rs.getBoolean("review_enabled")); }
    public List<Item> list(UUID owner,String query) {
        if(query.length()>500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Search is too long");
        String q=query.toLowerCase(Locale.ROOT);
        return db.query("select * from learning_items where owner_id=? and (position(? in lower(expression))>0 or position(? in lower(meaning))>0 or position(? in lower(tags))>0) order by created_at desc,id",NotebookService::map,owner,q,q,q);
    }
    public Item get(UUID owner,UUID id) { return db.query("select * from learning_items where id=? and owner_id=?",NotebookService::map,id,owner).stream().findFirst().orElseThrow(NotebookService::missing); }
    private void checkDuplicate(UUID owner,UUID excluding,Input body) {
        db.queryForObject("select id from accounts where id=? for update",UUID.class,owner);
        long count=db.queryForObject("select count(*) from learning_items where owner_id=? and lower(trim(expression))=? and lower(trim(meaning))=? and id<>?",Long.class,owner,body.expression().trim().toLowerCase(Locale.ROOT),body.meaning().trim().toLowerCase(Locale.ROOT),excluding);
        if(count>0) throw new ResponseStatusException(HttpStatus.CONFLICT,"This expression and meaning are already in your notebook");
    }
    @Transactional public Item create(UUID owner,Input body) {
        UUID id=UUID.randomUUID();checkDuplicate(owner,id,body);
        db.update("insert into learning_items(id,owner_id,expression,meaning,context,example,notes,tags,created_at,review_enabled) values(?,?,?,?,?,?,?,?,?,?)",id,owner,body.expression().trim(),body.meaning().trim(),text(body.context()),text(body.example()),text(body.notes()),text(body.tags()),OffsetDateTime.now(clock),body.reviewEnabled());
        syncCard(owner,id,body.reviewEnabled());return get(owner,id);
    }
    @Transactional public Item update(UUID owner,UUID id,Input body) {
        get(owner,id);checkDuplicate(owner,id,body);
        db.update("update learning_items set expression=?,meaning=?,context=?,example=?,notes=?,tags=?,review_enabled=? where id=? and owner_id=?",body.expression().trim(),body.meaning().trim(),text(body.context()),text(body.example()),text(body.notes()),text(body.tags()),body.reviewEnabled(),id,owner);
        syncCard(owner,id,body.reviewEnabled());return get(owner,id);
    }
    private void syncCard(UUID owner,UUID item,boolean enabled) {
        if(enabled && db.queryForObject("select count(*) from review_cards where learning_item_id=? and owner_id=?",Long.class,item,owner)==0)
            db.update("insert into review_cards(id,owner_id,learning_item_id,due_at) values(?,?,?,?)",UUID.randomUUID(),owner,item,OffsetDateTime.now(clock));
    }
    @Transactional public void delete(UUID owner,UUID id) {
        db.queryForObject("select id from accounts where id=? for update",UUID.class,owner);
        if(db.update("delete from learning_items where id=? and owner_id=?",id,owner)!=1) throw missing();
    }
    private String text(String value) { return value==null?"":value; }
    private static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND,"Learning item not found"); }
}
