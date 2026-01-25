package com.project.freelance.freelancing_platform.dto;

import java.math.BigDecimal;
import java.util.List;

public class RequirementRequest {
    public String title;
    public String description;
    public BigDecimal minPrice;
    public BigDecimal maxPrice;
    public List<String> skills;
    public Integer yoeRequired;
}
