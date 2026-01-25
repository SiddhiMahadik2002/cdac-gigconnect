package com.project.freelance.freelancing_platform.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class ProposalResponse {
    public Long id;
    public Long requirementId;
    public Long freelancerId;
    public String message;
    public BigDecimal proposedPrice;
    public String status;
    public OffsetDateTime createdAt;

    // New fields for completion workflow
    public String completionNotes;
    public String clientFeedback;
    public String rejectionReason;
    public OffsetDateTime submittedAt;
    public OffsetDateTime completedAt;

    // Enriched requirement details (for ongoing jobs view)
    public String requirementTitle;
    public String requirementDescription;
    public Long clientId;
    public String clientName;
}
