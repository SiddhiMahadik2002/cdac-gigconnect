package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.GigRequest;
import com.project.freelance.freelancing_platform.dto.GigResponse;
import com.project.freelance.freelancing_platform.model.Gig;
import com.project.freelance.freelancing_platform.service.GigService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/gigs")
public class GigController {
    private final GigService gigService;

    public GigController(GigService gigService) {
        this.gigService = gigService;
    }

    @PostMapping
    public ResponseEntity<GigResponse> createGig(@Valid @RequestBody GigRequest req, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof com.project.freelance.freelancing_platform.model.User)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        com.project.freelance.freelancing_platform.model.User user = (com.project.freelance.freelancing_platform.model.User) principal;
        if (user.getUserType() == null || !"FREELANCER".equalsIgnoreCase(user.getUserType())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        Long freelancerId = user.getUserId();
        Gig g = gigService.createGig(freelancerId, req);
        return ResponseEntity.ok(toDto(g));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GigResponse> updateGig(@PathVariable Long id, @RequestBody GigRequest req,
            Authentication auth) {
        Long freelancerId = extractUserId(auth);
        Gig g = gigService.updateGig(freelancerId, id, req);
        return ResponseEntity.ok(toDto(g));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGig(@PathVariable Long id, Authentication auth) {
        Long freelancerId = extractUserId(auth);
        gigService.softDeleteGig(freelancerId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public Page<GigResponse> listGigs(@RequestParam(required = false) String skill,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return gigService.searchGigs(skill, minPrice, maxPrice, pageable).map(this::toDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GigResponse> getGig(@PathVariable Long id) {
        Gig g = gigService.getGig(id);
        return ResponseEntity.ok(toDto(g));
    }

    private GigResponse toDto(Gig g) {
        GigResponse r = new GigResponse();
        r.id = g.getId();
        r.freelancerId = g.getFreelancer() != null ? g.getFreelancer().getFreelancerId() : null;
        r.title = g.getTitle();
        r.description = g.getDescription();
        r.fixedPrice = g.getFixedPrice();
        r.skills = g.getSkills();
        r.status = g.getStatus().name();
        r.createdAt = g.getCreatedAt();
        r.updatedAt = g.getUpdatedAt();
        return r;
    }

    private Long extractUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null)
            throw new SecurityException("Unauthenticated");
        Object p = auth.getPrincipal();
        try {
            java.lang.reflect.Method m = p.getClass().getMethod("getUserId");
            Object id = m.invoke(p);
            return Long.parseLong(String.valueOf(id));
        } catch (Exception ex) {
            throw new SecurityException("Unable to extract user id");
        }
    }
}
