package com.project.freelance.freelancing_platform.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import com.project.freelance.freelancing_platform.dto.ReviewResponse;

public class GigResponse {
    public Long id;
    public Long freelancerId;
    public String title;
    public String description;
    public BigDecimal fixedPrice;
    public String skills;
    public String status;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
    // Freelancer meta
    public String freelancerName;
    public String freelancerTitle;
    public String freelancerDescription;
    public Double averageRating;
    public Long ratingCount;
    public List<ReviewResponse> recentReviews;
}
