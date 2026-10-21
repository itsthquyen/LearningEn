package com.learningen;

import com.learningen.notebook.NotebookService;
import com.learningen.notebook.NotebookDtos.Input;
import com.learningen.notebook.NotebookDtos.Item;
import jakarta.validation.Valid;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/learning-items")
public class LearningController {
    private final NotebookService service;private final Accounts accounts;
    public LearningController(NotebookService service,Accounts accounts) { this.service=service;this.accounts=accounts; }
    static Item map(ResultSet rs,int n) throws SQLException { return NotebookService.map(rs,n); }
    @GetMapping public List<Item> list(Authentication auth,@RequestParam(defaultValue="") String q) { return service.list(accounts.owner(auth),q); }
    @GetMapping("/{id}") public Item get(Authentication auth,@PathVariable UUID id) { return service.get(accounts.owner(auth),id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Item create(Authentication auth,@Valid @RequestBody Input input) { return service.create(accounts.owner(auth),input); }
    @PutMapping("/{id}") public Item update(Authentication auth,@PathVariable UUID id,@Valid @RequestBody Input input) { return service.update(accounts.owner(auth),id,input); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Authentication auth,@PathVariable UUID id) { service.delete(accounts.owner(auth),id); }
    static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND,"Resource not found"); }
}
