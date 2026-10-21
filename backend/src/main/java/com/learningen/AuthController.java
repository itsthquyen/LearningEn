package com.learningen;

import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.ZoneId;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class AuthController {
    private final Accounts accounts;
    private final JdbcTemplate db;
    private final AuthenticationManager manager;
    private final SecurityContextRepository contexts;
    private final CookieCsrfTokenRepository csrf;
    public AuthController(Accounts accounts, JdbcTemplate db, AuthenticationManager manager, SecurityContextRepository contexts, CookieCsrfTokenRepository csrf) {
        this.accounts = accounts; this.db = db; this.manager = manager; this.contexts = contexts; this.csrf = csrf;
    }
    public record Login(@NotBlank @Email @Size(max=254) String email, @NotBlank @Size(max=72) String password) {}
    public record Profile(@NotBlank @Size(max=100) String displayName, @NotNull @Min(1) @Max(480) Integer dailyMinutes, @NotBlank @Size(max=100) String timeZone, @NotNull Boolean retainHistory) {}
    @GetMapping("/auth/csrf") public Map<String, String> csrf(CsrfToken token) { return Map.of("token", token.getToken(), "headerName", token.getHeaderName()); }
    @PostMapping("/auth/login") public Map<String,Object> login(@Valid @RequestBody Login body, HttpServletRequest request, HttpServletResponse response) {
        Authentication auth;
        try { auth = manager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(body.email().trim(), body.password())); }
        catch (AuthenticationException e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"); }
        if (request.getSession(false) != null) request.changeSessionId(); else request.getSession(true);
        var context = SecurityContextHolder.createEmptyContext(); context.setAuthentication(auth); SecurityContextHolder.setContext(context);
        contexts.saveContext(context, request, response);
        csrf.saveToken(null, request, response);
        csrf.saveToken(csrf.generateToken(request), request, response);
        return accounts.profile(accounts.owner(auth));
    }
    @PostMapping("/auth/logout") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        if (request.getSession(false) != null) request.getSession(false).invalidate();
        SecurityContextHolder.clearContext(); csrf.saveToken(null, request, response);
        var cookie = new Cookie("JSESSIONID", ""); cookie.setPath("/"); cookie.setMaxAge(0); cookie.setHttpOnly(true); cookie.setSecure(request.isSecure()); response.addCookie(cookie);
    }
    @GetMapping("/auth/me") public Map<String,Object> me(Authentication auth) { return accounts.profile(accounts.owner(auth)); }
    @PatchMapping("/profile") public Map<String,Object> profile(Authentication auth, @Valid @RequestBody Profile body) {
        try { ZoneId.of(body.timeZone()); } catch (java.time.DateTimeException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time zone"); }
        UUID owner = accounts.owner(auth);
        db.update("update accounts set display_name=?,daily_minutes=?,time_zone=?,retain_history=? where id=?", body.displayName().trim(), body.dailyMinutes(), body.timeZone(), body.retainHistory(), owner);
        return accounts.profile(owner);
    }
}
