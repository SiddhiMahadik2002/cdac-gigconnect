package com.project.freelance.freelancing_platform.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.project.freelance.freelancing_platform.model.User;
import com.project.freelance.freelancing_platform.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.acceptUnsigned:false}")
    private boolean acceptUnsigned;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Always clear the security context first to prevent session-like behavior
        // between users
        SecurityContextHolder.clearContext();

        String token = null;
        // Prefer Authorization header Bearer token
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("AUTH_TOKEN".equals(c.getName())) {
                    token = c.getValue();
                    break;
                }
            }
        }

        if (token != null) {
            log.debug("JwtAuthenticationFilter: found token of length {}", token.length());
            boolean authenticated = false;
            if (jwtUtil.validateToken(token)) {
                try {
                    Long userId = jwtUtil.getUserIdFromToken(token);
                    log.debug("JwtAuthenticationFilter: token validated, userId={}", userId);
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        String role = "ROLE_" + (user.getUserType() == null ? "USER" : user.getUserType());
                        log.debug("JwtAuthenticationFilter: found user from DB id={}, role={}", userId, role);
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null,
                                List.of(new SimpleGrantedAuthority(role)));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        authenticated = true;
                    }
                } catch (Exception ignored) {
                }
            }

            if (!authenticated && acceptUnsigned) {
                try {
                    log.debug("JwtAuthenticationFilter: token not validated, attempting unsigned decode (dev)");
                    String[] parts = token.split("\\.");
                    if (parts.length == 3) {
                        String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode node = mapper.readTree(payload);
                        Long userId = node.has("sub") ? node.get("sub").asLong() : null;
                        String type = node.has("type") ? node.get("type").asText() : null;
                        log.debug("JwtAuthenticationFilter: decoded payload sub={}, type={}", userId, type);

                        User user = null;
                        if (userId != null) {
                            user = userRepository.findById(userId).orElse(null);
                            if (user != null) {
                                log.debug("JwtAuthenticationFilter: found user from DB - id={}, email={}, type={}",
                                        user.getUserId(), user.getEmail(), user.getUserType());
                            } else {
                                log.warn("JwtAuthenticationFilter: User with ID {} not found in database", userId);
                            }
                        }

                        if (user == null) {
                            log.debug("JwtAuthenticationFilter: creating temporary user object for userId={}, type={}",
                                    userId, type);
                            user = new User();
                            if (userId != null)
                                user.setUserId(userId);
                            user.setUserType(type);
                        }

                        String role = "ROLE_" + (user.getUserType() == null ? "USER" : user.getUserType());
                        log.debug("JwtAuthenticationFilter: assigning role {} for user id {}", role, user.getUserId());
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null,
                                List.of(new SimpleGrantedAuthority(role)));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        authenticated = true;
                    }
                } catch (Exception e) {
                    log.warn("JwtAuthenticationFilter: Error in unsigned token decode: {}", e.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
