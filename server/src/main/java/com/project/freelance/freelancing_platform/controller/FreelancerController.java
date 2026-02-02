package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.model.FreelancerProfile;
import com.project.freelance.freelancing_platform.proposal.Proposal;
import com.project.freelance.freelancing_platform.proposal.ProposalRepository;
import com.project.freelance.freelancing_platform.model.Order;
import com.project.freelance.freelancing_platform.repository.OrderRepository;
import com.project.freelance.freelancing_platform.model.Review;
import com.project.freelance.freelancing_platform.repository.ReviewRepository;
import com.project.freelance.freelancing_platform.dto.ReviewResponse;
import com.project.freelance.freelancing_platform.dto.FreelancerProfileResponse;
import com.project.freelance.freelancing_platform.dto.ProposalResponse;
import com.project.freelance.freelancing_platform.mapper.ProposalMapper;
import com.project.freelance.freelancing_platform.repository.FreelancerProfileRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.util.List;

@RestController
@RequestMapping("/api/v1/freelancers")
public class FreelancerController {
    private final FreelancerProfileRepository repo;
    private final ProposalRepository proposalRepository;
    private final ProposalMapper proposalMapper;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    public FreelancerController(FreelancerProfileRepository repo, ProposalRepository proposalRepository,
            ProposalMapper proposalMapper, OrderRepository orderRepository, ReviewRepository reviewRepository) {
        this.repo = repo;
        this.proposalRepository = proposalRepository;
        this.proposalMapper = proposalMapper;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<FreelancerProfile> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public FreelancerProfileResponse get(@PathVariable Long id) {
        FreelancerProfile fp = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Freelancer not found"));

        // (previous proposal-based rating queries removed; using reviews table below)
        // Use dedicated reviews table (persisted) as canonical source for freelancer
        // reviews
        Double avg = reviewRepository.findAverageRatingByFreelancerId(id);
        Long countReviews = reviewRepository.countByFreelancerIdWithRating(id);
        java.util.List<Review> reviews = reviewRepository.findTop5ByFreelancerFreelancerIdOrderByCreatedAtDesc(id);

        java.util.List<ReviewResponse> reviewDtos = reviews.stream().map(r -> {
            ReviewResponse rr = new ReviewResponse();
            rr.id = r.getId();
            rr.freelancerId = r.getFreelancer() != null ? r.getFreelancer().getFreelancerId() : null;
            rr.clientId = r.getClient() != null ? r.getClient().getClientId() : null;
            if (r.getClient() != null && r.getClient().getUser() != null) {
                rr.clientName = (r.getClient().getUser().getFirstName() == null ? ""
                        : r.getClient().getUser().getFirstName()) +
                        " "
                        + (r.getClient().getUser().getLastName() == null ? "" : r.getClient().getUser().getLastName());
                rr.clientName = rr.clientName.trim();
            }
            rr.rating = r.getRating();
            rr.feedback = r.getFeedback();
            rr.createdAt = r.getCreatedAt();
            return rr;
        }).collect(Collectors.toList());

        FreelancerProfileResponse resp = new FreelancerProfileResponse();
        resp.freelancerId = id;
        resp.title = fp.getTitle();
        resp.description = fp.getDescription();
        if (fp.getUser() != null) {
            resp.firstName = fp.getUser().getFirstName();
            resp.lastName = fp.getUser().getLastName();
            resp.email = fp.getUser().getEmail();
        }
        resp.averageRating = avg != null ? avg : 0.0;
        resp.ratingCount = countReviews != null ? countReviews : 0L;
        // Convert ReviewResponse list into ProposalResponse-shaped list for backward
        // compatibility
        // We'll reuse ProposalResponse.clientFeedback and rating fields to return
        // recent reviews
        java.util.List<com.project.freelance.freelancing_platform.dto.ProposalResponse> recent = reviewDtos.stream()
                .map(rr -> {
                    com.project.freelance.freelancing_platform.dto.ProposalResponse pr = new com.project.freelance.freelancing_platform.dto.ProposalResponse();
                    pr.id = rr.id;
                    pr.clientId = rr.clientId;
                    pr.clientName = rr.clientName;
                    pr.clientFeedback = rr.feedback;
                    pr.rating = rr.rating;
                    pr.completedAt = rr.createdAt;
                    return pr;
                }).collect(Collectors.toList());

        resp.recentReviews = recent;
        // include social links and skills when available
        resp.linkedin = fp.getLinkedin();
        resp.github = fp.getGithub();
        resp.portfolio = fp.getPortfolio();
        resp.skills = fp.getSkills();
        // total earnings (only count COMPLETED orders)
        java.math.BigDecimal earnings = orderRepository.sumAmountByFreelancerIdAndStatus(id,
                com.project.freelance.freelancing_platform.model.Order.OrderStatus.COMPLETED);
        resp.totalEarnings = earnings != null ? earnings : java.math.BigDecimal.ZERO;
        return resp;
    }

    @PutMapping("/me")
    public FreelancerProfileResponse updateMyProfile(
            @Valid @RequestBody com.project.freelance.freelancing_platform.dto.FreelancerProfileRequest req,
            Authentication auth) {
        Long userId = extractUserId(auth);
        FreelancerProfile fp = repo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Freelancer not found"));

        if (req.title != null)
            fp.setTitle(req.title);
        String desc = req.getEffectiveDescription();
        if (desc != null)
            fp.setDescription(desc);

        String ln = req.getEffectiveLinkedin();
        if (ln != null)
            fp.setLinkedin(ln);

        String gh = req.getEffectiveGithub();
        if (gh != null)
            fp.setGithub(gh);

        String pf = req.getEffectivePortfolio();
        if (pf != null)
            fp.setPortfolio(pf);

        if (req.skills != null) {
            // join list into comma-separated string for storage
            String joined = String.join(",", req.skills);
            fp.setSkills(joined);
        }

        // support frontend sending fullName; parse and update user's first/last name
        String fn = req.getFirstNameFromFullName();
        String lastFromFullName = req.getLastNameFromFullName();
        if ((fn != null || lastFromFullName != null) && fp.getUser() != null) {
            if (fn != null)
                fp.getUser().setFirstName(fn);
            if (lastFromFullName != null)
                fp.getUser().setLastName(lastFromFullName);
        }

        repo.save(fp);

        FreelancerProfileResponse resp = new FreelancerProfileResponse();
        resp.freelancerId = fp.getFreelancerId();
        resp.title = fp.getTitle();
        resp.description = fp.getDescription();
        if (fp.getUser() != null) {
            resp.firstName = fp.getUser().getFirstName();
            resp.lastName = fp.getUser().getLastName();
            resp.email = fp.getUser().getEmail();
        }
        resp.linkedin = fp.getLinkedin();
        resp.github = fp.getGithub();
        resp.portfolio = fp.getPortfolio();
        resp.skills = fp.getSkills();

        java.math.BigDecimal earnings = orderRepository.sumAmountByFreelancerIdAndStatus(resp.freelancerId,
                com.project.freelance.freelancing_platform.model.Order.OrderStatus.COMPLETED);
        resp.totalEarnings = earnings != null ? earnings : java.math.BigDecimal.ZERO;

        Double avg = reviewRepository.findAverageRatingByFreelancerId(resp.freelancerId);
        Long countReviews = reviewRepository.countByFreelancerIdWithRating(resp.freelancerId);
        resp.averageRating = avg != null ? avg : 0.0;
        resp.ratingCount = countReviews != null ? countReviews : 0L;

        return resp;
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

    // Pattern captures review text (group 1) and rating digit 1-5 (group 2) when
    // feedback ends with a 'Rating: N' line
    private static final Pattern FEEDBACK_RATING = Pattern
            .compile("(?is)^(.*?)(?:\\s*\\r?\\n)*\\s*Rating\\s*[:\\-]?\\s*([1-5])\\s*$");

    private void extractRatingFromFeedback(Proposal p) {
        if (p == null)
            return;
        if (p.getRating() != null)
            return; // already present
        String fb = p.getClientFeedback();
        if (fb == null)
            return;
        Matcher m = FEEDBACK_RATING.matcher(fb.trim());
        if (m.find()) {
            String reviewText = m.group(1) != null ? m.group(1).trim() : "";
            String ratingStr = m.group(2);
            try {
                p.setRating(Integer.parseInt(ratingStr));
            } catch (NumberFormatException ignored) {
            }
            p.setClientFeedback(reviewText);
        }
    }

    private int extractRatingFromTextAndClean(StringBuilderHolder sbHolder) {
        if (sbHolder == null || sbHolder.value == null)
            return 0;
        return extractRatingFromTextAndClean(sbHolder.value);
    }

    private int extractRatingFromTextAndClean(String feedback) {
        if (feedback == null)
            return 0;
        Matcher m = FEEDBACK_RATING.matcher(feedback.trim());
        if (m.find()) {
            String reviewText = m.group(1) != null ? m.group(1).trim() : "";
            String ratingStr = m.group(2);
            try {
                int r = Integer.parseInt(ratingStr);
                return r;
            } catch (NumberFormatException ignored) {
            }
        }
        return 0;
    }

    // small helper to allow passing mutable string in some contexts
    private static class StringBuilderHolder {
        String value;
    }
}
