package com.learningen.notebook;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;

public final class NotebookDtos {
    private NotebookDtos() {}
    public record Item(UUID id,String expression,String meaning,String context,String example,String notes,String tags,Instant createdAt,boolean reviewEnabled) {}
    public record Input(@NotBlank @Size(max=500) String expression,@NotBlank @Size(max=2000) String meaning,@Size(max=4000) String context,@Size(max=4000) String example,@Size(max=8000) String notes,@Size(max=1000) String tags,@NotNull Boolean reviewEnabled) {}
}
