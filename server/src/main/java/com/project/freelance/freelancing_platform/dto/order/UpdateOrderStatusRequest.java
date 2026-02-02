package com.project.freelance.freelancing_platform.dto.order;

import com.project.freelance.freelancing_platform.model.Order;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update order status")
public class UpdateOrderStatusRequest {

    @NotNull
    @Schema(description = "New order status", example = "IN_PROGRESS")
    private Order.OrderStatus status;

    @Schema(description = "Delivery notes (for DELIVERED status)", example = "Work completed as per requirements")
    private String deliveryNotes;

    @Schema(description = "Client notes (for feedback/approval)", example = "Great work, approved!")
    private String clientNotes;

    @Schema(description = "Revision notes (for REVISION_REQUESTED status)", example = "Please update the color scheme")
    private String revisionNotes;

    @Schema(description = "Optional numeric rating (1-5) provided by client", example = "5")
    private Integer rating;

    @Schema(description = "Delivery date (auto-set for DELIVERED status)")
    private OffsetDateTime deliveryDate;
}