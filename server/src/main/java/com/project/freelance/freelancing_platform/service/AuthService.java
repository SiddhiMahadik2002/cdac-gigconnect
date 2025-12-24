package com.project.freelance.freelancing_platform.service;

import com.project.freelance.freelancing_platform.dto.RegisterRequest;
import com.project.freelance.freelancing_platform.model.FreelancerProfile;
import com.project.freelance.freelancing_platform.model.User;
import com.project.freelance.freelancing_platform.repository.FreelancerProfileRepository;
import com.project.freelance.freelancing_platform.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    private final Key jwtKey;
    private final long jwtExpirationMs;

    public AuthService(UserRepository userRepository,
            FreelancerProfileRepository freelancerProfileRepository,
            PasswordEncoder passwordEncoder,
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration-ms}") long jwtExpirationMs) {
        this.userRepository = userRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public User registerFreelancer(RegisterRequest req) {
        if (userRepository.findByEmail(req.email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        User u = new User();
        u.setEmail(req.email);
        u.setPasswordHash(passwordEncoder.encode(req.password));
        u.setUserType("FREELANCER");
        u.setFirstName(req.firstName);
        u.setLastName(req.lastName);
        u.setPhoneNumber(req.phoneNumber);
        userRepository.save(u);

        FreelancerProfile fp = new FreelancerProfile();
        fp.setUser(u);
        fp.setTitle(req.title);
        fp.setDescription(req.description);
        freelancerProfileRepository.save(fp);

        return u;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Date iat = Date.from(now);
        Date exp = Date.from(now.plusMillis(jwtExpirationMs));

        return Jwts.builder()
                .setSubject(String.valueOf(user.getUserId()))
                .setIssuedAt(iat)
                .setExpiration(exp)
                .claim("email", user.getEmail())
                .claim("type", user.getUserType())
                .signWith(jwtKey, SignatureAlgorithm.HS256)
                .compact();
    }
}
