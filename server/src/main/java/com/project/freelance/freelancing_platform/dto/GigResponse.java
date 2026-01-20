package com.project.freelance.freelancing_platform.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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
}
