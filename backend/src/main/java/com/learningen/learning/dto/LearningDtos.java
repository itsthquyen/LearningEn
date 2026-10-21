package com.learningen.learning.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;

public final class LearningDtos {
    private LearningDtos() {}
    public record Course(UUID id, String title, String level, String description, String contentStatus, long lessonCount, long completedCount) {}
    public record Lesson(UUID id, UUID courseId, String title, String objective, int position, String kind, String contentStatus, String status, Integer bestScore) {}
    public record Question(String id, String prompt, List<String> options, String type) {}
    public record Detail(UUID id, UUID courseId, String title, String objective, int position, String kind, String contentStatus, String status, Integer bestScore, String body, List<Question> questions, Map<String,String> draftAnswers) {}
    public record Draft(@NotNull @Size(max=30) Map<@NotBlank @Size(max=100) String,@NotNull @Size(max=4000) String> answers) {}
    public record Attempt(@NotNull UUID requestId, @NotNull @Size(max=30) Map<@NotBlank @Size(max=100) String,@NotNull @Size(max=4000) String> answers, @NotNull Boolean assisted) {}
    public record Feedback(String questionId, Boolean correct, String expected, String explanation) {}
    public record Result(UUID id, UUID lessonId, Integer score, boolean passed, boolean assisted, List<Feedback> feedback, Instant createdAt) {}
}
