package com.project.freelance.freelancing_platform.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class RequirementResponse {
    public Long id;
    public Long clientId;
    public String clientName;
    public String title;
    public String description;
    public BigDecimal minPrice;
    public BigDecimal maxPrice;
    public List<String> skills;
    public Integer yoeRequired;
    public String status;
    public OffsetDateTime createdAt;
    public Long totalProposals;
}
