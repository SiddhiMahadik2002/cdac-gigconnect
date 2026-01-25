package com.project.freelance.freelancing_platform.service.impl;

import com.project.freelance.freelancing_platform.dto.ProposalRequest;
import com.project.freelance.freelancing_platform.dto.ProposalResponse;
import com.project.freelance.freelancing_platform.dto.CompletionRequest;
import com.project.freelance.freelancing_platform.dto.CompletionApprovalRequest;
import com.project.freelance.freelancing_platform.dto.CompletionRejectionRequest;
import com.project.freelance.freelancing_platform.mapper.ProposalMapper;
import com.project.freelance.freelancing_platform.model.FreelancerProfile;
import com.project.freelance.freelancing_platform.proposal.Proposal;
import com.project.freelance.freelancing_platform.proposal.ProposalRepository;
import com.project.freelance.freelancing_platform.requirement.Requirement;
import com.project.freelance.freelancing_platform.requirement.RequirementRepository;
import com.project.freelance.freelancing_platform.service.ProposalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProposalServiceImpl implements ProposalService {
    private final ProposalRepository proposalRepository;
    private final RequirementRepository requirementRepository;
    private final ProposalMapper proposalMapper;

    public ProposalServiceImpl(ProposalRepository proposalRepository, RequirementRepository requirementRepository,
            ProposalMapper proposalMapper) {
        this.proposalRepository = proposalRepository;
        this.requirementRepository = requirementRepository;
        this.proposalMapper = proposalMapper;
    }

    @Override
    public ProposalResponse createProposal(Long requirementId, ProposalRequest req, Long freelancerId) {
        if (proposalRepository.existsByRequirementIdAndFreelancerFreelancerId(requirementId, freelancerId)) {
            throw new IllegalArgumentException("Already applied");
        }
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
        Proposal p = new Proposal();
        p.setRequirement(requirement);
        FreelancerProfile f = new FreelancerProfile();
        f.setFreelancerId(freelancerId);
        p.setFreelancer(f);
        p.setMessage(req.message);
        p.setProposedPrice(req.proposedPrice);
        Proposal saved = proposalRepository.save(p);
        return proposalMapper.toResponse(saved);
    }

    @Override
    public List<ProposalResponse> listProposalsForRequirement(Long requirementId, Long clientId) {
        Requirement r = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
        if (!r.getClient().getClientId().equals(clientId))
            throw new SecurityException("Not owner");
        return proposalRepository.findByRequirementId(requirementId).stream().map(proposalMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProposalResponse acceptProposal(Long proposalId, Long clientId) {
        Proposal p = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));
        Requirement r = p.getRequirement();
        if (!r.getClient().getClientId().equals(clientId))
            throw new SecurityException("Not owner");

        // Accept this proposal and move to IN_PROGRESS
        p.setStatus(com.project.freelance.freelancing_platform.proposal.ProposalStatus.IN_PROGRESS);
        Proposal savedProposal = proposalRepository.save(p);

        // Update requirement status to IN_PROGRESS (work started)
        r.setStatus(com.project.freelance.freelancing_platform.requirement.RequirementStatus.IN_PROGRESS);
        requirementRepository.save(r);

        // Reject all other proposals for this requirement
        List<Proposal> otherProposals = proposalRepository.findByRequirementId(r.getId());
        for (Proposal other : otherProposals) {
            if (!other.getId().equals(p.getId())) {
                other.setStatus(com.project.freelance.freelancing_platform.proposal.ProposalStatus.REJECTED);
                other.setRejectionReason("Another freelancer was selected for this project");
                proposalRepository.save(other);
            }
        }

        return proposalMapper.toResponse(savedProposal);
    }

    @Override
    public List<ProposalResponse> listFreelancerProposals(Long freelancerId) {
        return proposalRepository.findByFreelancerFreelancerId(freelancerId).stream().map(proposalMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProposalResponse requestCompletion(Long proposalId, Long freelancerId, CompletionRequest req) {
        Proposal p = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));

        if (!p.getFreelancer().getFreelancerId().equals(freelancerId))
            throw new SecurityException("Not the assigned freelancer");

        if (p.getStatus() != com.project.freelance.freelancing_platform.proposal.ProposalStatus.IN_PROGRESS)
            throw new IllegalStateException("Proposal must be IN_PROGRESS to request completion");

        // Update proposal status to AWAITING_COMPLETION
        p.setStatus(com.project.freelance.freelancing_platform.proposal.ProposalStatus.AWAITING_COMPLETION);
        p.setCompletionNotes(req.completionNotes);
        p.setSubmittedAt(OffsetDateTime.now());

        proposalRepository.save(p);
        return proposalMapper.toResponse(p);
    }

    @Override
    public ProposalResponse approveCompletion(Long proposalId, Long clientId, CompletionApprovalRequest req) {
        Proposal p = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));
        Requirement r = p.getRequirement();

        if (!r.getClient().getClientId().equals(clientId))
            throw new SecurityException("Not the project owner");

        if (p.getStatus() != com.project.freelance.freelancing_platform.proposal.ProposalStatus.AWAITING_COMPLETION)
            throw new IllegalStateException("Proposal must be AWAITING_COMPLETION to approve");

        // Mark proposal as COMPLETED
        p.setStatus(com.project.freelance.freelancing_platform.proposal.ProposalStatus.COMPLETED);
        p.setClientFeedback(req.feedback);
        p.setCompletedAt(OffsetDateTime.now());

        // Mark requirement as COMPLETED
        r.setStatus(com.project.freelance.freelancing_platform.requirement.RequirementStatus.COMPLETED);

        proposalRepository.save(p);
        requirementRepository.save(r);

        return proposalMapper.toResponse(p);
    }

    @Override
    public ProposalResponse rejectCompletion(Long proposalId, Long clientId, CompletionRejectionRequest req) {
        Proposal p = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));
        Requirement r = p.getRequirement();

        if (!r.getClient().getClientId().equals(clientId))
            throw new SecurityException("Not the project owner");

        if (p.getStatus() != com.project.freelance.freelancing_platform.proposal.ProposalStatus.AWAITING_COMPLETION)
            throw new IllegalStateException("Proposal must be AWAITING_COMPLETION to reject");

        // Move proposal back to IN_PROGRESS
        p.setStatus(com.project.freelance.freelancing_platform.proposal.ProposalStatus.IN_PROGRESS);
        p.setClientFeedback(req.feedback + "\n\nRequested Changes: " + req.requestedChanges);
        p.setSubmittedAt(null); // Reset submission time

        proposalRepository.save(p);

        return proposalMapper.toResponse(p);
    }

    @Override
    public List<ProposalResponse> listOngoingJobs(Long freelancerId) {
        // Get proposals that are IN_PROGRESS or AWAITING_COMPLETION (active work)
        return proposalRepository.findByFreelancerFreelancerId(freelancerId).stream()
                .filter(p -> p
                        .getStatus() == com.project.freelance.freelancing_platform.proposal.ProposalStatus.IN_PROGRESS
                        || p.getStatus() == com.project.freelance.freelancing_platform.proposal.ProposalStatus.AWAITING_COMPLETION)
                .map(proposalMapper::toResponse)
                .collect(Collectors.toList());
    }
}
