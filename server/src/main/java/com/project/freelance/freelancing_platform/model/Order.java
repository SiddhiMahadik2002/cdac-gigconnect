package com.project.freelance.freelancing_platform.model;

import com.project.freelance.freelancing_platform.proposal.Proposal;
import com.project.freelance.freelancing_platform.requirement.Requirement;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_source", nullable = false)
    private OrderSource orderSource;

    // Client who placed the order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    // Freelancer who will fulfill the order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private FreelancerProfile freelancer;

    // Optional: For direct gig purchases
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gig_id")
    private Gig gig;

    // Optional: For proposal-based orders
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;

    // Optional: For proposal-based orders
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id")
    private Proposal proposal;

    @Column(name = "payment_id", nullable = false)
    private String paymentId; // Reference to Payment table

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "title", nullable = false)
    private String title; // Order title (gig title or requirement title)

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Order description

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    @Column(name = "delivery_date")
    private OffsetDateTime deliveryDate;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    @Column(name = "client_notes", columnDefinition = "TEXT")
    private String clientNotes;

    @Column(name = "revision_notes", columnDefinition = "TEXT")
    private String revisionNotes;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "started_at")
    private OffsetDateTime startedAt; // When work began

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt; // When work was delivered

    @Column(name = "completed_at")
    private OffsetDateTime completedAt; // When order was completed

    public enum OrderType {
        GIG_PURCHASE, // Direct purchase of a pre-made gig
        CUSTOM_PROJECT // Custom project from accepted proposal
    }

    public enum OrderSource {
        DIRECT_GIG, // Purchased directly from gig listing
        ACCEPTED_PROPOSAL // Created from accepted proposal
    }

    public enum OrderStatus {
        PENDING_PAYMENT, // Payment not yet confirmed
        CONFIRMED, // Payment confirmed, ready to start
        IN_PROGRESS, // Work has begun
        SUBMITTED_FOR_REVIEW, // Freelancer submitted work for client review
        DELIVERED, // Freelancer has delivered work
        REVISION_REQUESTED, // Client requested revisions
        COMPLETED, // Client approved and order completed
        CANCELLED, // Order was cancelled
        REFUNDED // Order was refunded
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Helper methods to determine order context
    public boolean isGigPurchase() {
        return orderType == OrderType.GIG_PURCHASE;
    }

    public boolean isCustomProject() {
        return orderType == OrderType.CUSTOM_PROJECT;
    }

    public boolean canBeStarted() {
        return status == OrderStatus.CONFIRMED;
    }

    public boolean canBeDelivered() {
        return status == OrderStatus.IN_PROGRESS;
    }

    public boolean canBeCompleted() {
        return status == OrderStatus.SUBMITTED_FOR_REVIEW || status == OrderStatus.DELIVERED;
    }

    public boolean canRequestRevision() {
        return status == OrderStatus.SUBMITTED_FOR_REVIEW || status == OrderStatus.DELIVERED;
    }
}