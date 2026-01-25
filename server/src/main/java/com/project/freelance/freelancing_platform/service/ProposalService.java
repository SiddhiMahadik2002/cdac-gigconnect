package com.project.freelance.freelancing_platform.service;

import com.project.freelance.freelancing_platform.dto.ProposalRequest;
import com.project.freelance.freelancing_platform.dto.ProposalResponse;
import com.project.freelance.freelancing_platform.dto.CompletionRequest;
import com.project.freelance.freelancing_platform.dto.CompletionApprovalRequest;
import com.project.freelance.freelancing_platform.dto.CompletionRejectionRequest;

import java.util.List;

public interface ProposalService {
    ProposalResponse createProposal(Long requirementId, ProposalRequest req, Long freelancerId);

    List<ProposalResponse> listProposalsForRequirement(Long requirementId, Long clientId);

    ProposalResponse acceptProposal(Long proposalId, Long clientId);

    List<ProposalResponse> listFreelancerProposals(Long freelancerId);

    // New completion workflow methods
    ProposalResponse requestCompletion(Long proposalId, Long freelancerId, CompletionRequest req);

    ProposalResponse approveCompletion(Long proposalId, Long clientId, CompletionApprovalRequest req);

    ProposalResponse rejectCompletion(Long proposalId, Long clientId, CompletionRejectionRequest req);

    List<ProposalResponse> listOngoingJobs(Long freelancerId);
}
