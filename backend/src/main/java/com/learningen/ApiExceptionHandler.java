package com.learningen;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final org.slf4j.Logger log=org.slf4j.LoggerFactory.getLogger(ApiExceptionHandler.class);
    @ExceptionHandler(ResponseStatusException.class)
    ProblemDetail status(ResponseStatusException e) { return ProblemDetail.forStatusAndDetail(e.getStatusCode(), e.getReason() == null ? "Request could not be completed" : e.getReason()); }
    @ExceptionHandler({MethodArgumentNotValidException.class, IllegalArgumentException.class, org.springframework.http.converter.HttpMessageNotReadableException.class, org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class})
    ProblemDetail invalid(Exception e) { return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid request fields or values"); }
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    ProblemDetail conflict(Exception e) { return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,"Conflicting resource or invalid backup relationships"); }
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    ProblemDetail upload(Exception e) { return ProblemDetail.forStatusAndDetail(HttpStatus.PAYLOAD_TOO_LARGE,"Image upload exceeds the server request limit; resize images or send fewer images"); }
    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception e, HttpServletRequest request) {
        if(e instanceof org.springframework.web.ErrorResponse response) return response.getBody();
        log.error("Unhandled API error: method={}, path={}, type={}",request.getMethod(),request.getRequestURI(),e.getClass().getName());
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "The request could not be completed safely");
    }
}
