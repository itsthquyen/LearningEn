package com.learningen;

import java.util.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class Accounts implements UserDetailsService, ApplicationRunner {
    private final JdbcTemplate db;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;
    public Accounts(JdbcTemplate db, PasswordEncoder encoder, @Value("${app.bootstrap.email}") String email, @Value("${app.bootstrap.password}") String password) {
        this.db = db; this.encoder = encoder; this.email = email.trim().toLowerCase(Locale.ROOT); this.password = password;
    }
    @Override public void run(ApplicationArguments args) {
        if (db.queryForObject("select count(*) from accounts", Long.class) == 0) {
            if (email.isBlank() || !email.contains("@") || email.length() > 254 || password.length() < 12 || password.length() > 72) {
                throw new IllegalStateException("Set BOOTSTRAP_EMAIL and BOOTSTRAP_PASSWORD (12-72 characters) to initialize the private account");
            }
            db.update("insert into accounts(id,email,password_hash,display_name) values (?,?,?,?)", UUID.randomUUID(), email, encoder.encode(password), "Learner");
        }
    }
    @Override public UserDetails loadUserByUsername(String username) {
        return db.query("select email,password_hash from accounts where email=?", (rs, n) -> User.withUsername(rs.getString(1)).password(rs.getString(2)).roles("USER").build(), username.toLowerCase(Locale.ROOT)).stream().findFirst().orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
    }
    public UUID owner(Authentication auth) {
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required");
        return db.query("select id from accounts where email=?", (rs, n) -> rs.getObject(1, UUID.class), auth.getName()).stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required"));
    }
    public Map<String, Object> profile(UUID owner) {
        return db.queryForObject("select * from accounts where id=?", (rs, n) -> Map.of("id", rs.getObject("id", UUID.class), "email", rs.getString("email"), "displayName", rs.getString("display_name"), "dailyMinutes", rs.getInt("daily_minutes"), "timeZone", rs.getString("time_zone"), "retainHistory", rs.getBoolean("retain_history")), owner);
    }
}
