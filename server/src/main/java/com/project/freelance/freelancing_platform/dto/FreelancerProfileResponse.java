package com.project.freelance.freelancing_platform.dto;

import java.util.List;
import java.math.BigDecimal;

public class FreelancerProfileResponse {
    public Long freelancerId;
    public String title;
    public String description;

    // Social links
    public String linkedin;
    public String github;
    public String portfolio;

    // Comma/semicolon separated skills string
    public String skills;

    // Basic user info
    public String firstName;
    public String lastName;
    public String email;

    public Double averageRating;
    public Long ratingCount;
    public BigDecimal totalEarnings;

    public List<ProposalResponse> recentReviews;
}
