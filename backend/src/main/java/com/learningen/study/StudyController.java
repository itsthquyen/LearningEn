package com.learningen.study;

import com.learningen.Accounts;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/study-sessions")
public class StudyController {
    private final Accounts accounts;private final StudyService service;
    public StudyController(Accounts accounts,StudyService service) { this.accounts=accounts;this.service=service; }
    @GetMapping("/current") public ResponseEntity<StudyService.Session> current(Authentication auth) { var session=service.current(accounts.owner(auth));return session==null?ResponseEntity.noContent().build():ResponseEntity.ok(session); }
    @PostMapping public StudyService.Session start(Authentication auth,@Valid @RequestBody StudyService.Start input) { return service.start(accounts.owner(auth),input); }
    @PutMapping("/{id}") public StudyService.Session update(Authentication auth,@PathVariable UUID id,@Valid @RequestBody StudyService.Update input) { return service.update(accounts.owner(auth),id,input); }
}
