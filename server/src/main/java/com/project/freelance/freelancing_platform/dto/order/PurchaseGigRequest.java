package com.project.freelance.freelancing_platform.dto.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to purchase a gig")
public class PurchaseGigRequest {

    @NotBlank
    @Schema(description = "Payment ID from Razorpay", example = "pay_abc123")
    private String paymentId;

    @Schema(description = "Additional notes from client", example = "Please deliver within 3 days")
    private String clientNotes;
}