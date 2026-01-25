package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.LoginRequest;
import com.project.freelance.freelancing_platform.dto.RegisterRequest;
import com.project.freelance.freelancing_platform.model.User;
import com.project.freelance.freelancing_platform.repository.UserRepository;
import com.project.freelance.freelancing_platform.service.AuthService;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
        private final AuthService authService;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        public AuthController(AuthService authService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
                this.authService = authService;
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegisterRequest req, HttpServletResponse response) {
                User u = authService.register(req);

                // Generate JWT token for the newly registered user
                String token = authService.generateToken(u);

                // Set JWT token in HTTP-only cookie with cross-origin settings
                ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", token)
                                .httpOnly(true)
                                .secure(false) // allow non-HTTPS for local development
                                .sameSite("Lax")
                                .path("/")
                                .maxAge(24 * 60 * 60) // 24 hours
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(Map.of(
                                                "message", "User registered successfully",
                                                "userId", u.getUserId(),
                                                "email", u.getEmail(),
                                                "token", token)); // Include token as fallback
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse response) {
                User user = userRepository.findByEmail(req.email)
                                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
                if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
                        throw new IllegalArgumentException("Invalid credentials");
                }

                String token = authService.generateToken(user);

                ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", token)
                                .httpOnly(true)
                                .secure(false) // allow non-HTTPS for local development
                                .sameSite("Lax")
                                .path("/")
                                .maxAge(24 * 60 * 60) // 24 hours
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(Map.of(
                                                "message", "Login successful",
                                                "userId", user.getUserId(),
                                                "email", user.getEmail(),
                                                "role", user.getUserType(),
                                                "token", token)); // Include token as fallback
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletResponse response) {
                // Clear the security context to ensure proper logout
                SecurityContextHolder.clearContext();

                // Clear the JWT cookie by setting it to expire immediately
                ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", "")
                                .httpOnly(true)
                                .secure(false) // allow non-HTTPS for local development
                                .sameSite("Lax")
                                .path("/")
                                .maxAge(0) // Expire immediately
                                .build();

                return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                                .body(Map.of("message", "Logged out successfully"));
        }

        @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
                // Get the authenticated user from security context
                var authentication = SecurityContextHolder.getContext().getAuthentication();

                if (authentication != null && authentication.getPrincipal() instanceof User) {
                        User user = (User) authentication.getPrincipal();

                        // Fetch fresh user data from database to ensure we have complete info
                        User freshUser = userRepository.findById(user.getUserId()).orElse(user);

                        String fullName = (freshUser.getFirstName() != null ? freshUser.getFirstName() : "") +
                                        (freshUser.getLastName() != null ? " " + freshUser.getLastName() : "");

                        // Use HashMap to handle null values properly (Map.of doesn't allow nulls)
                        Map<String, Object> response = new HashMap<>();
                        response.put("userId", freshUser.getUserId() != null ? freshUser.getUserId() : 0L);
                        response.put("email", freshUser.getEmail() != null ? freshUser.getEmail() : "");
                        response.put("fullName", fullName.trim());
                        response.put("role", freshUser.getUserType() != null ? freshUser.getUserType() : "USER");

                        return ResponseEntity.ok().body(response);
                }

                return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
}
