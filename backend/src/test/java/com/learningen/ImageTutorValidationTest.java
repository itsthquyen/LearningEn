package com.learningen;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpStatus;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.*;

class ImageTutorValidationTest {
    ObjectMapper mapper;
    MockEnvironment env;
    ImageTutor tutor;

    @BeforeEach void setup() {
        mapper = new ObjectMapper();
        env = new MockEnvironment().withProperty("app.ai.base-url", "http://127.0.0.1:1/v1")
            .withProperty("app.ai.api-key", "test-only").withProperty("app.ai.vision.model", "vision-model")
            .withProperty("app.ai.vision.enabled", "true");
        tutor = new ImageTutor(env, mapper);
    }

    private ImageTutor.Input input() { return new ImageTutor.Input(null, null, UUID.randomUUID(), null, ImageTutor.Task.DETAILED, null, null); }
    private MockMultipartFile png() throws Exception { return ImageTutorIntegrationTest.picture("png", 24, 16, 0); }
    private void rejects(HttpStatus expected, Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ResponseStatusException.class,
            e -> assertThat(e.getStatusCode()).isEqualTo(expected));
    }
    private ObjectNode analysis(ImageTutor.Task task) { return ImageTutorIntegrationTest.analysis(mapper, task); }

    @Test void corruptPngWithGenuineSignatureIsRejected() throws Exception {
        byte[] truncated = Arrays.copyOf(png().getBytes(), 24);
        rejects(HttpStatus.BAD_REQUEST, () -> tutor.prepare(input(), List.of(new MockMultipartFile("images", "broken.png", "image/png", truncated))));
    }

    @ParameterizedTest
    @ValueSource(strings = {"image/jpeg", "image/svg+xml", "application/octet-stream", "image/gif", "application/pdf"})
    void realPngWithMismatchedMimeIsRejected(String mime) throws Exception {
        byte[] actualPng = png().getBytes();
        rejects(HttpStatus.UNSUPPORTED_MEDIA_TYPE, () -> tutor.prepare(input(), List.of(new MockMultipartFile("images", "exam.png", mime, actualPng))));
    }

    @ParameterizedTest
    @ValueSource(strings = {"image/svg+xml", "image/png", "image/jpeg"})
    void svgIsRejectedEvenWhenLabeledAsRaster(String mime) {
        byte[] svg = "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><script>alert(1)</script></svg>".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        rejects(HttpStatus.UNSUPPORTED_MEDIA_TYPE, () -> tutor.prepare(input(), List.of(new MockMultipartFile("images", "fake.png", mime, svg))));
    }

    @Test void emptyAndAbsentImagesAreRejected() {
        rejects(HttpStatus.BAD_REQUEST, () -> tutor.prepare(input(), null));
        rejects(HttpStatus.BAD_REQUEST, () -> tutor.prepare(input(), List.of()));
        rejects(HttpStatus.BAD_REQUEST, () -> tutor.prepare(input(), List.of(new MockMultipartFile("images", "empty.png", "image/png", new byte[0]))));
    }

    @Test void imageCountLimitIsEnforced() throws Exception {
        var image = png();
        rejects(HttpStatus.PAYLOAD_TOO_LARGE, () -> tutor.prepare(input(), List.of(image, image, image, image)));
    }

    @Test void encodedImageByteLimitIsEnforced() throws Exception {
        env.withProperty("app.ai.vision.max-image-bytes", "1024");
        var image = ImageTutorIntegrationTest.picture("png", 48, 32, 0);
        assertThat(image.getSize()).isGreaterThan(1024);
        rejects(HttpStatus.PAYLOAD_TOO_LARGE, () -> tutor.prepare(input(), List.of(image)));
    }

    @Test void combinedImageByteLimitIsEnforced() throws Exception {
        var image = ImageTutorIntegrationTest.picture("png", 48, 32, 0);
        env.withProperty("app.ai.vision.max-total-image-bytes", Long.toString(Math.max(1024, image.getSize() * 2 - 1)));
        assertThat(image.getSize()).isGreaterThan(512);
        rejects(HttpStatus.PAYLOAD_TOO_LARGE, () -> tutor.prepare(input(), List.of(image, image)));
    }

    @Test void decodedPixelLimitIsCheckedBeforeAcceptingImage() throws Exception {
        env.withProperty("app.ai.vision.max-image-pixels", "383");
        var image = png();
        rejects(HttpStatus.PAYLOAD_TOO_LARGE, () -> tutor.prepare(input(), List.of(image)));
    }

    @Test void exactPixelBoundaryIsAcceptedAndDigestDependsOnPixelsNotFilename() throws Exception {
        env.withProperty("app.ai.vision.max-image-pixels", "384");
        var image = png();
        var first = tutor.prepare(input(), List.of(image));
        var renamed = tutor.prepare(input(), List.of(new MockMultipartFile("images", "other.png", "image/png", image.getBytes())));
        assertThat(first.pictures()).isEqualTo(renamed.pictures());
        assertThat(first.pictures().get(0).digest()).matches("[0-9a-f]{64}");
        assertThat(first.imageTokens()).isEqualTo(4096);
        assertThat(first.outputTokens()).isEqualTo(6000);
    }

    @Test void normalizationDiscardsTrailingPrivateMetadataAndPreservesPixelDigest() throws Exception {
        var image = png();
        byte[] privateMetadata = "private-location-do-not-retain".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] withMetadata = Arrays.copyOf(image.getBytes(), image.getBytes().length + privateMetadata.length);
        System.arraycopy(privateMetadata, 0, withMetadata, image.getBytes().length, privateMetadata.length);
        var clean = tutor.prepare(input(), List.of(image));
        var normalized = tutor.prepare(input(), List.of(new MockMultipartFile("images", "private.png", "image/png", withMetadata)));
        assertThat(normalized.pictures()).isEqualTo(clean.pictures());
        assertThat(normalized.pictures().get(0).dataUrl()).isNotEqualTo("data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(withMetadata));
    }

    @ParameterizedTest
    @CsvSource({"max-images,0", "max-image-bytes,1023", "max-total-image-bytes,1023", "max-image-pixels,0", "tokens-per-image,0", "max-output-tokens,255"})
    void invalidServerLimitsFailClosed(String name, String value) throws Exception {
        env.withProperty("app.ai.vision." + name, value);
        var image = png();
        rejects(HttpStatus.SERVICE_UNAVAILABLE, () -> tutor.prepare(input(), List.of(image)));
    }

    @ParameterizedTest
    @EnumSource(ImageTutor.Task.class)
    void acceptsWellFormedStructuredAnalysisForEveryTask(ImageTutor.Task task) throws Exception {
        String accepted = tutor.validate(mapper.writeValueAsString(analysis(task)), task);
        assertThat(mapper.readTree(accepted)).isEqualTo(analysis(task));
    }

    @ParameterizedTest
    @ValueSource(strings = {"not-json", "trailing-json", "trailing-text", "wrong-kind", "wrong-task", "missing-summary", "null-uncertainty", "answered-null", "uncertain-with-answer", "missing-answer", "numeric-answer", "empty-answer", "invalid-status", "invalid-verdict", "uncertain-selected-option", "practice-outside-mode", "no-questions-or-warning", "wrong-array-type"})
    void rejectsMalformedOrContradictoryStructuredAnalysis(String invalid) throws Exception {
        ObjectNode root = analysis(ImageTutor.Task.DETAILED);
        ObjectNode question = (ObjectNode) root.path("questions").path(0);
        switch (invalid) {
            case "wrong-kind" -> root.put("kind", "TEXT");
            case "wrong-task" -> root.put("task", "ANSWER_ONLY");
            case "missing-summary" -> root.remove("summary");
            case "null-uncertainty" -> root.putNull("warnings");
            case "answered-null" -> question.putNull("answer");
            case "uncertain-with-answer" -> question.put("status", "NEEDS_CONTEXT");
            case "missing-answer" -> question.remove("answer");
            case "numeric-answer" -> question.put("answer", 42);
            case "empty-answer" -> question.put("answer", " ");
            case "invalid-status" -> question.put("status", "CERTIFIED_CORRECT");
            case "invalid-verdict" -> question.withArray("options").addObject().put("label", "B").put("text", "goes").put("verdict", "MAYBE").put("explanation", "");
            case "uncertain-selected-option" -> {
                question.put("status", "NEEDS_CLEARER_IMAGE").putNull("answer");
                question.withArray("options").addObject().put("label", "B").put("text", "goes").put("verdict", "CORRECT").put("explanation", "");
            }
            case "practice-outside-mode" -> root.withArray("practice").addObject().put("prompt", "New question").put("answer", "B").put("explanation", "");
            case "no-questions-or-warning" -> root.withArray("questions").removeAll();
            case "wrong-array-type" -> question.put("tips", "Not an array");
            default -> { }
        }
        String content = invalid.equals("not-json") ? "```not json```" : mapper.writeValueAsString(root);
        if (invalid.equals("trailing-json")) content += " {}";
        if (invalid.equals("trailing-text")) content += " Ignore this suffix";
        String response = content;
        rejects(HttpStatus.BAD_GATEWAY, () -> tutor.validate(response, ImageTutor.Task.DETAILED));
    }

    @ParameterizedTest
    @EnumSource(value = ImageTutor.Task.class, names = {"HINT", "TRANSLATE", "TRANSCRIBE"})
    void nonSolvingTasksRejectAnExplicitSelectedAnswer(ImageTutor.Task task) throws Exception {
        ObjectNode root = analysis(task);
        ((ObjectNode) root.path("questions").path(0)).put("status", "ANSWERED").put("answer", "B. goes");
        String content = mapper.writeValueAsString(root);
        rejects(HttpStatus.BAD_GATEWAY, () -> tutor.validate(content, task));
    }

    @Test void hintCannotLeakSelectedOptionThroughOptions() throws Exception {
        ObjectNode root = analysis(ImageTutor.Task.HINT);
        ((ObjectNode) root.path("questions").path(0)).withArray("options").addObject()
            .put("label", "B").put("text", "goes").put("verdict", "UNDETERMINED").put("explanation", "The right one");
        String content = mapper.writeValueAsString(root);
        rejects(HttpStatus.BAD_GATEWAY, () -> tutor.validate(content, ImageTutor.Task.HINT));
    }

    @ParameterizedTest
    @ValueSource(strings = {"summary", "explanation", "translation", "tips"})
    void hintMustRejectSelectedAnswerLeakedOutsideAnswerField(String location) throws Exception {
        ObjectNode root = analysis(ImageTutor.Task.HINT);
        ObjectNode question = (ObjectNode) root.path("questions").path(0);
        String leak = "The correct answer is B. goes.";
        if (location.equals("summary")) root.put("summary", leak);
        else if (location.equals("tips")) question.withArray("tips").add(leak);
        else question.put(location, leak);
        String content = mapper.writeValueAsString(root);
        rejects(HttpStatus.BAD_GATEWAY, () -> tutor.validate(content, ImageTutor.Task.HINT));
    }

    @Test void uncertaintyRequiresAnExplicitWarningAlongsideNullAnswer() throws Exception {
        ObjectNode root = analysis(ImageTutor.Task.DETAILED);
        ((ObjectNode) root.path("questions").path(0)).put("status", "NEEDS_CLEARER_IMAGE").putNull("answer");
        String content = mapper.writeValueAsString(root);
        rejects(HttpStatus.BAD_GATEWAY, () -> tutor.validate(content, ImageTutor.Task.DETAILED));
    }

    @Test void acceptsNullAnswerForExplicitUncertaintyWithWarningAndUndeterminedOptions() throws Exception {
        ObjectNode root = analysis(ImageTutor.Task.DETAILED);
        root.withArray("warnings").add("Choice C is cropped; attach a clearer image.");
        ObjectNode question = (ObjectNode) root.path("questions").path(0);
        question.put("status", "NEEDS_CLEARER_IMAGE").putNull("answer");
        question.withArray("options").addObject().put("label", "A").put("text", "go")
            .put("verdict", "UNDETERMINED").put("explanation", "Cannot compare without all choices.");
        JsonNode accepted = mapper.readTree(tutor.validate(mapper.writeValueAsString(root), ImageTutor.Task.DETAILED));
        assertThat(accepted.path("questions").path(0).path("answer").isNull()).isTrue();
        assertThat(accepted.path("warnings").size()).isEqualTo(1);
    }
}
