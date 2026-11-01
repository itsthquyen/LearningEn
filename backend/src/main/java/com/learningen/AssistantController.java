package com.learningen;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
public class AssistantController {
    private final Accounts accounts; private final AiService ai; private final ImageTutor images;
    public AssistantController(Accounts accounts,AiService ai,ImageTutor images) { this.accounts=accounts;this.ai=ai;this.images=images; }
    @GetMapping("/assistant-capabilities") public Map<String,Object> capabilities() { return images.capabilities(); }
    @PostMapping(value="/assistant-requests",consumes=MediaType.APPLICATION_JSON_VALUE) public Object send(Authentication auth,@Valid @RequestBody AiService.Input input) { return ai.send(accounts.owner(auth),input,input.conversationId(),false); }
    @PostMapping(value="/assistant-requests",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public Object image(Authentication auth,@Valid @RequestPart("metadata") ImageTutor.Input input,@RequestPart("images") List<MultipartFile> files) {
        var owner=accounts.owner(auth);
        return ai.sendImages(owner,images.prepare(input,files));
    }
}
