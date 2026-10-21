package com.learningen;

import java.util.*;
import jakarta.servlet.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.*;
import org.springframework.security.web.context.*;
import org.springframework.web.cors.*;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    @Bean AuthenticationManager authenticationManager(Accounts accounts, PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(accounts);
        provider.setPasswordEncoder(encoder);
        return new ProviderManager(provider);
    }
    @Bean SecurityContextRepository contextRepository() { return new HttpSessionSecurityContextRepository(); }
    @Bean CookieCsrfTokenRepository csrfRepository(@Value("${app.cookie-secure}") boolean secure) {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieCustomizer(cookie -> cookie.path("/").sameSite("Lax").secure(secure));
        return repository;
    }
    @Bean SecurityFilterChain security(HttpSecurity http, CookieCsrfTokenRepository csrf, SecurityContextRepository contexts, ObjectMapper mapper, @Value("${app.cors-origins}") String origins) throws Exception {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
        cors.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/**", cors);
        http.cors(c -> c.configurationSource(source))
            .csrf(c -> c.csrfTokenRepository(csrf).csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .securityContext(c -> c.securityContextRepository(contexts))
            .authorizeHttpRequests(a -> a.requestMatchers("/api/v1/auth/csrf", "/api/v1/auth/login").permitAll().anyRequest().authenticated())
            .requestCache(c -> c.disable()).formLogin(c -> c.disable()).httpBasic(c -> c.disable())
            .logout(c -> c.disable())
            .exceptionHandling(c -> c.authenticationEntryPoint((req, res, ex) -> problem(res, mapper, 401, "Sign in required"))
                .accessDeniedHandler((req, res, ex) -> problem(res, mapper, 403, "Access denied or CSRF token missing or expired")));
        return http.build();
    }
    private static void problem(HttpServletResponse response, ObjectMapper mapper, int status, String detail) throws java.io.IOException {
        response.setStatus(status); response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), ProblemDetail.forStatusAndDetail(HttpStatus.valueOf(status), detail));
    }
}
