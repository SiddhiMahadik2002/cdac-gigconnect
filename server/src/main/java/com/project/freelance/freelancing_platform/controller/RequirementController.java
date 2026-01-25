package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.RequirementRequest;
import com.project.freelance.freelancing_platform.dto.RequirementResponse;
import com.project.freelance.freelancing_platform.dto.ProposalResponse;
import com.project.freelance.freelancing_platform.service.RequirementService;
import com.project.freelance.freelancing_platform.service.ProposalService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/requirements")
public class RequirementController {
    private final RequirementService requirementService;
    private final ProposalService proposalService;

    public RequirementController(RequirementService requirementService, ProposalService proposalService) {
        this.requirementService = requirementService;
        this.proposalService = proposalService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> create(@RequestBody RequirementRequest req) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long clientId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        RequirementResponse resp = requirementService.createRequirement(req, clientId);
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<Page<RequirementResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(requirementService.listRequirementsForFreelancers(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<RequirementResponse>> myRequirements() {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long clientId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(requirementService.listClientRequirements(clientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('FREELANCER')")
    public ResponseEntity<RequirementResponse> getRequirementById(@PathVariable Long id) {
        RequirementResponse resp = requirementService.getRequirementDetails(id);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}/proposals")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<ProposalResponse>> getProposalsForRequirement(@PathVariable Long id) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long clientId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        return ResponseEntity.ok(proposalService.listProposalsForRequirement(id, clientId));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> close(@PathVariable Long id) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long clientId = ((com.project.freelance.freelancing_platform.model.User) principal).getUserId();
        requirementService.closeRequirement(id, clientId);
        return ResponseEntity.ok(Map.of("message", "closed"));
    }
}
