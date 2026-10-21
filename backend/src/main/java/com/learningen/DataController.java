package com.learningen;

import com.fasterxml.jackson.databind.JsonNode;
import com.learningen.data.BackupService;
import com.learningen.data.DashboardService;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class DataController {
    private final Accounts accounts;private final DashboardService dashboard;private final BackupService backup;
    public DataController(Accounts accounts,DashboardService dashboard,BackupService backup) { this.accounts=accounts;this.dashboard=dashboard;this.backup=backup; }
    @GetMapping("/dashboard") public Map<String,Object> dashboard(Authentication auth) { return dashboard.dashboard(accounts.owner(auth)); }
    @GetMapping("/data-export") public Map<String,Object> export(Authentication auth) { return backup.export(accounts.owner(auth)); }
    @PostMapping("/data-import") public Map<String,Object> restore(Authentication auth,@RequestBody JsonNode data) { return backup.restore(accounts.owner(auth),data); }
    @DeleteMapping("/personal-data") @ResponseStatus(HttpStatus.NO_CONTENT) public void clear(Authentication auth) { backup.clear(accounts.owner(auth)); }
}
