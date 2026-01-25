package com.project.freelance.freelancing_platform.proposal;

public enum ProposalStatus {
    PENDING, // Waiting for client decision
    ACCEPTED, // Client selected (transitional, moves to IN_PROGRESS)
    IN_PROGRESS, // Work is actively ongoing
    AWAITING_COMPLETION, // Freelancer submitted completion, waiting client approval
    COMPLETED, // Client approved, project finished
    REJECTED // Not selected by client OR completion rejected
}
