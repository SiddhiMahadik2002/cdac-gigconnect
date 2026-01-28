package com.project.freelance.freelancing_platform.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.freelance.freelancing_platform.model.Payment;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Reference type is required")
    private Payment.ReferenceType referenceType;

    @NotNull(message = "Reference ID is required")
    @JsonProperty("referenceId")
    private String referenceId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least 1.00")
    private BigDecimal amount;

    // Currency is optional - defaults to INR if not provided
    private String currency;

    // Custom setter to handle numeric referenceId from frontend
    public void setReferenceId(Object referenceId) {
        this.referenceId = (referenceId != null) ? String.valueOf(referenceId) : null;
    }

    // Custom setter to handle numeric amount from frontend
    public void setAmount(Object amount) {
        if (amount instanceof Number) {
            this.amount = BigDecimal.valueOf(((Number) amount).doubleValue());
        } else if (amount instanceof String) {
            this.amount = new BigDecimal((String) amount);
        } else if (amount instanceof BigDecimal) {
            this.amount = (BigDecimal) amount;
        }
    }

    // Helper method to get currency with default
    public String getCurrency() {
        return (currency == null || currency.trim().isEmpty()) ? "INR" : currency.trim();
    }
}