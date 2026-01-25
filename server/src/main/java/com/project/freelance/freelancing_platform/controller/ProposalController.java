package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.ProposalRequest;
import com.project.freelance.freelancing_platform.dto.ProposalResponse;
import com.project.freelance.freelancing_platform.dto.CompletionRequest;
import com.project.freelance.freelancing_platform.dto.CompletionApprovalRequest;
import com.project.freelance.freelancing_platform.dto.CompletionRejectionRequest;
import com.project.freelance.freelancing_platform.service.ProposalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProposalController {
    private final ProposalService proposalService;

    public ProposalController(ProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @PostMapping("/api/v1/requirements/{id}/proposals")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ProposalResponse> submitProposal(@PathVariable("id") Long requirementId,
            @RequestBody ProposalRequest req) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long freelancerId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        ProposalResponse resp = proposalService.createProposal(requirementId, req, freelancerId);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/api/v1/proposals/{id}/accept")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ProposalResponse> acceptProposal(@PathVariable Long id) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long clientId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(proposalService.acceptProposal(id, clientId));
    }

    @GetMapping("/api/v1/proposals/me")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<List<ProposalResponse>> myProposals() {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long freelancerId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(proposalService.listFreelancerProposals(freelancerId));
    }

    @GetMapping("/api/v1/proposals/me/ongoing")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<List<ProposalResponse>> myOngoingJobs() {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long freelancerId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(proposalService.listOngoingJobs(freelancerId));
    }

    @PostMapping("/api/v1/proposals/{id}/request-completion")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ProposalResponse> requestCompletion(@PathVariable Long id,
            @RequestBody CompletionRequest req) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long freelancerId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(proposalService.requestCompletion(id, freelancerId, req));
    }

    @PostMapping("/api/v1/proposals/{id}/approve-completion")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ProposalResponse> approveCompletion(@PathVariable Long id,
            @RequestBody CompletionApprovalRequest req) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long clientId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(proposalService.approveCompletion(id, clientId, req));
    }

    @PostMapping("/api/v1/proposals/{id}/reject-completion")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ProposalResponse> rejectCompletion(@PathVariable Long id,
            @RequestBody CompletionRejectionRequest req) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long clientId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(proposalService.rejectCompletion(id, clientId, req));
    }
}
