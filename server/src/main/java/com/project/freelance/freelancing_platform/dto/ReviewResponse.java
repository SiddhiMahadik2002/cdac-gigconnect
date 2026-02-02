package com.project.freelance.freelancing_platform.dto;

import java.time.OffsetDateTime;

public class ReviewResponse {
    public Long id;
    public Long freelancerId;
    public Long clientId;
    public String clientName;
    public Integer rating;
    public String feedback;
    public OffsetDateTime createdAt;
}
