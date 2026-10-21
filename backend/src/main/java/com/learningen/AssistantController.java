package com.learningen;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/assistant-requests")
public class AssistantController {
    private final Accounts accounts; private final AiService ai;
    public AssistantController(Accounts accounts,AiService ai) { this.accounts=accounts;this.ai=ai; }
    @PostMapping public Object send(Authentication auth,@Valid @RequestBody AiService.Input input) { return ai.send(accounts.owner(auth),input,input.conversationId(),false); }
}
