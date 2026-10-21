package com.learningen.learning.controller;

import com.learningen.Accounts;
import com.learningen.learning.dto.LearningDtos.*;
import com.learningen.learning.service.CourseService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class CourseController {
    private final Accounts accounts;private final CourseService service;
    public CourseController(Accounts accounts,CourseService service) { this.accounts=accounts;this.service=service; }
    @GetMapping("/courses") public List<Course> courses(Authentication auth) { return service.courses(accounts.owner(auth)); }
    @GetMapping("/courses/{id}/lessons") public List<Lesson> lessons(Authentication auth,@PathVariable UUID id) { return service.lessons(accounts.owner(auth),id); }
    @GetMapping("/lessons/{id}") public Detail detail(Authentication auth,@PathVariable UUID id) { return service.detail(accounts.owner(auth),id); }
    @PutMapping("/lessons/{id}/draft") public Detail draft(Authentication auth,@PathVariable UUID id,@Valid @RequestBody Draft input) { return service.draft(accounts.owner(auth),id,input); }
    @PostMapping("/lessons/{id}/attempts") public Object attempt(Authentication auth,@PathVariable UUID id,@Valid @RequestBody Attempt input) { return service.attempt(accounts.owner(auth),id,input); }
}
