package com.project.freelance.freelancing_platform.dto.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to accept a proposal and create order")
public class AcceptProposalRequest {

    @NotBlank
    @Schema(description = "Payment ID from Razorpay", example = "pay_abc123")
    private String paymentId;

    @Schema(description = "Additional notes from client", example = "Looking forward to working with you")
    private String clientNotes;
}