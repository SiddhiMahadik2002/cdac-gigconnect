package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.GigRequest;
import com.project.freelance.freelancing_platform.dto.GigResponse;
import com.project.freelance.freelancing_platform.dto.ReviewResponse;
import com.project.freelance.freelancing_platform.model.FreelancerProfile;
import com.project.freelance.freelancing_platform.model.Review;
import com.project.freelance.freelancing_platform.repository.FreelancerProfileRepository;
import com.project.freelance.freelancing_platform.repository.ReviewRepository;
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
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final ReviewRepository reviewRepository;

    public GigController(GigService gigService,
            FreelancerProfileRepository freelancerProfileRepository,
            ReviewRepository reviewRepository) {
        this.gigService = gigService;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.reviewRepository = reviewRepository;
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
            @RequestParam(required = false, name = "search") String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Priority: category (for filtering skills) -> search -> skill
        String effective = null;
        if (category != null && !category.isBlank()) {
            effective = category;
        } else if (search != null && !search.isBlank()) {
            effective = search;
        } else {
            effective = skill;
        }
        return gigService.searchGigs(effective, minPrice, maxPrice, pageable).map(this::toDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GigResponse> getGig(@PathVariable Long id) {
        Gig g = gigService.getGig(id);
        return ResponseEntity.ok(toDto(g));
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<Page<GigResponse>> getGigsByFreelancer(
            @PathVariable Long freelancerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Gig> gigs = gigService.getGigsByFreelancer(freelancerId, pageable);
        return ResponseEntity.ok(gigs.map(this::toDto));
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
        // Populate freelancer meta if available
        if (r.freelancerId != null) {
            FreelancerProfile fp = freelancerProfileRepository.findById(r.freelancerId).orElse(null);
            if (fp != null) {
                if (fp.getUser() != null) {
                    String fn = fp.getUser().getFirstName() != null ? fp.getUser().getFirstName() : "";
                    String ln = fp.getUser().getLastName() != null ? fp.getUser().getLastName() : "";
                    r.freelancerName = (fn + " " + ln).trim();
                }
                r.freelancerTitle = fp.getTitle();
                r.freelancerDescription = fp.getDescription();

                // Ratings and recent reviews
                Double avg = reviewRepository.findAverageRatingByFreelancerId(r.freelancerId);
                Long count = reviewRepository.countByFreelancerIdWithRating(r.freelancerId);
                r.averageRating = avg != null ? avg : 0.0;
                r.ratingCount = count != null ? count : 0L;

                java.util.List<Review> recent = reviewRepository
                        .findTop5ByFreelancerFreelancerIdOrderByCreatedAtDesc(r.freelancerId);
                if (recent != null && !recent.isEmpty()) {
                    r.recentReviews = recent.stream().map(rv -> {
                        ReviewResponse rr = new ReviewResponse();
                        rr.id = rv.getId();
                        rr.freelancerId = rv.getFreelancer() != null ? rv.getFreelancer().getFreelancerId() : null;
                        if (rv.getClient() != null) {
                            rr.clientId = rv.getClient().getClientId();
                            if (rv.getClient().getUser() != null) {
                                String cf = rv.getClient().getUser().getFirstName() != null
                                        ? rv.getClient().getUser().getFirstName()
                                        : "";
                                String cl = rv.getClient().getUser().getLastName() != null
                                        ? rv.getClient().getUser().getLastName()
                                        : "";
                                rr.clientName = (cf + " " + cl).trim();
                            }
                        }
                        rr.rating = rv.getRating();
                        rr.feedback = rv.getFeedback();
                        rr.createdAt = rv.getCreatedAt();
                        return rr;
                    }).collect(java.util.stream.Collectors.toList());
                }
            }
        }
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
