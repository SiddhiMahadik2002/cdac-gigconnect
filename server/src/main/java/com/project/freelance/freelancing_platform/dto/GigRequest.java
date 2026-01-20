package com.project.freelance.freelancing_platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class GigRequest {
    @NotBlank
    public String title;

    public String description;

    @NotNull
    public BigDecimal fixedPrice;

    // JSON array string, e.g. ["java","spring"]
    public String skills;

    public String status; // OPTIONAL: ACTIVE/INACTIVE
}
