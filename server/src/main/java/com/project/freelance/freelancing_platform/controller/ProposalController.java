package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.ProposalRequest;
import com.project.freelance.freelancing_platform.dto.ProposalResponse;
import com.project.freelance.freelancing_platform.service.ProposalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/proposals")
public class ProposalController {
    private final ProposalService proposalService;

    public ProposalController(ProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @PostMapping("/requirements/{id}/submit")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ProposalResponse> submitProposal(@PathVariable("id") Long requirementId,
            @RequestBody ProposalRequest req) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long freelancerId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        ProposalResponse resp = proposalService.createProposal(requirementId, req, freelancerId);
        return ResponseEntity.ok(resp);
    }

    // Note: acceptProposal is now handled by OrderController.acceptProposal
    // This creates a unified order management system

    @GetMapping("/me")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<List<ProposalResponse>> myProposals() {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long freelancerId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(proposalService.listFreelancerProposals(freelancerId));
    }

    // Note: Ongoing jobs are now managed through OrderController.getMyFreelancerOrders
    // Use /api/v1/orders/my-work instead

    // Note: Completion workflow is now handled by OrderController
    // Use the unified order status endpoints:
    // - /api/v1/orders/{orderId}/deliver (for freelancers to deliver work)
    // - /api/v1/orders/{orderId}/approve (for clients to approve work)
    // - /api/v1/orders/{orderId}/request-revision (for clients to request revisions)
}
