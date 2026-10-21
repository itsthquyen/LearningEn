package com.learningen;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class Json {
    private final ObjectMapper mapper;
    public Json(ObjectMapper mapper) { this.mapper = mapper; }
    public String write(Object value) {
        try { return mapper.writeValueAsString(value); } catch (JsonProcessingException e) { throw new IllegalStateException("JSON encoding failed"); }
    }
    public Object read(String value) {
        try { return mapper.readValue(value, Object.class); } catch (JsonProcessingException e) { throw new IllegalStateException("Stored JSON invalid"); }
    }
}
