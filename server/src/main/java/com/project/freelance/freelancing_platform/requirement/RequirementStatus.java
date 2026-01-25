package com.project.freelance.freelancing_platform.requirement;

public enum RequirementStatus {
    OPEN, // Accepting proposals
    IN_PROGRESS, // Work started (proposal accepted)
    COMPLETED, // Work finished and approved by client
    CANCELLED, // Cancelled by client
    CLOSED // Legacy - no longer accepting proposals
}
