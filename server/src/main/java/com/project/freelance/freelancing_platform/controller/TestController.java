package com.project.freelance.freelancing_platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.project.freelance.freelancing_platform.repository.UserRepository;
import com.project.freelance.freelancing_platform.model.User;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/test")
public class TestController {

    private final UserRepository userRepository;

    public TestController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/public")
    public ResponseEntity<?> publicEndpoint() {
        return ResponseEntity.ok().body(Map.of(
                "message", "This is a public endpoint",
                "timestamp", System.currentTimeMillis()));
    }

    @GetMapping("/users")
    public ResponseEntity<?> listAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userInfo = users.stream().map(user -> {
            Map<String, Object> info = new HashMap<>();
            info.put("userId", user.getUserId());
            info.put("email", user.getEmail());
            info.put("firstName", user.getFirstName());
            info.put("lastName", user.getLastName());
            info.put("userType", user.getUserType());
            return info;
        }).collect(Collectors.toList());

        return ResponseEntity.ok().body(Map.of(
                "message", "All users in database",
                "totalUsers", users.size(),
                "users", userInfo,
                "timestamp", System.currentTimeMillis()));
    }

    @GetMapping("/protected")
    public ResponseEntity<?> protectedEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated()) {
            return ResponseEntity.ok().body(Map.of(
                    "message", "This is a protected endpoint",
                    "authenticated", true,
                    "principal", auth.getPrincipal().toString(),
                    "authorities", auth.getAuthorities().toString(),
                    "timestamp", System.currentTimeMillis()));
        } else {
            return ResponseEntity.ok().body(Map.of(
                    "message", "Authentication context not found",
                    "authenticated", false,
                    "timestamp", System.currentTimeMillis()));
        }
    }
}