package com.project.freelance.freelancing_platform.dto.order;

import com.project.freelance.freelancing_platform.model.Order;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Order response with all details")
public class OrderResponse {

    @Schema(description = "Order ID", example = "1")
    private Long id;

    @Schema(description = "Order type", example = "GIG_PURCHASE")
    private Order.OrderType orderType;

    @Schema(description = "Order source", example = "DIRECT_GIG")
    private Order.OrderSource orderSource;

    @Schema(description = "Order title", example = "Logo Design")
    private String title;

    @Schema(description = "Order description")
    private String description;

    @Schema(description = "Order amount", example = "100.00")
    private BigDecimal amount;

    @Schema(description = "Payment ID", example = "pay_abc123")
    private String paymentId;

    @Schema(description = "Current order status", example = "IN_PROGRESS")
    private Order.OrderStatus status;

    // Client info
    @Schema(description = "Client ID", example = "1")
    private Long clientId;

    @Schema(description = "Client name", example = "John Doe")
    private String clientName;

    @Schema(description = "Client email", example = "client@example.com")
    private String clientEmail;

    // Freelancer info
    @Schema(description = "Freelancer ID", example = "2")
    private Long freelancerId;

    @Schema(description = "Freelancer name", example = "Jane Smith")
    private String freelancerName;

    @Schema(description = "Freelancer email", example = "freelancer@example.com")
    private String freelancerEmail;

    // Optional related entities
    @Schema(description = "Gig ID (for gig purchases)", example = "1")
    private Long gigId;

    @Schema(description = "Gig title (for gig purchases)", example = "I will design a professional logo")
    private String gigTitle;

    @Schema(description = "Requirement ID (for custom projects)", example = "1")
    private Long requirementId;

    @Schema(description = "Requirement title (for custom projects)", example = "Need a website redesign")
    private String requirementTitle;

    @Schema(description = "Proposal ID (for custom projects)", example = "1")
    private Long proposalId;

    // Work details
    @Schema(description = "Delivery notes from freelancer")
    private String deliveryNotes;

    @Schema(description = "Client feedback/notes")
    private String clientNotes;

    @Schema(description = "Revision notes")
    private String revisionNotes;

    // Timestamps
    @Schema(description = "When order was created")
    private OffsetDateTime createdAt;

    @Schema(description = "When order was last updated")
    private OffsetDateTime updatedAt;

    @Schema(description = "When work started")
    private OffsetDateTime startedAt;

    @Schema(description = "When work was delivered")
    private OffsetDateTime deliveredAt;

    @Schema(description = "When order was completed")
    private OffsetDateTime completedAt;

    @Schema(description = "Expected delivery date")
    private OffsetDateTime deliveryDate;
}