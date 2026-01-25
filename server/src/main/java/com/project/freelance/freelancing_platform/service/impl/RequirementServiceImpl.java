package com.project.freelance.freelancing_platform.service.impl;

import com.project.freelance.freelancing_platform.dto.RequirementRequest;
import com.project.freelance.freelancing_platform.dto.RequirementResponse;
import com.project.freelance.freelancing_platform.mapper.RequirementMapper;
import com.project.freelance.freelancing_platform.model.Client;
import com.project.freelance.freelancing_platform.proposal.ProposalRepository;
import com.project.freelance.freelancing_platform.requirement.Requirement;
import com.project.freelance.freelancing_platform.requirement.RequirementRepository;
import com.project.freelance.freelancing_platform.service.RequirementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RequirementServiceImpl implements RequirementService {
    private final RequirementRepository requirementRepository;
    private final RequirementMapper requirementMapper;
    private final ProposalRepository proposalRepository;

    public RequirementServiceImpl(RequirementRepository requirementRepository, RequirementMapper requirementMapper,
            ProposalRepository proposalRepository) {
        this.requirementRepository = requirementRepository;
        this.requirementMapper = requirementMapper;
        this.proposalRepository = proposalRepository;
    }

    @Override
    public RequirementResponse createRequirement(RequirementRequest req, Long clientId) {
        Requirement r = requirementMapper.toEntity(req);
        Client c = new Client();
        c.setClientId(clientId);
        r.setClient(c);
        Requirement saved = requirementRepository.save(r);
        return requirementMapper.toResponse(saved);
    }

    @Override
    public Page<RequirementResponse> listRequirementsForFreelancers(Pageable pageable) {
        return requirementRepository
                .findByStatus(com.project.freelance.freelancing_platform.requirement.RequirementStatus.OPEN, pageable)
                .map(requirementMapper::toResponse);
    }

    @Override
    public List<RequirementResponse> listClientRequirements(Long clientId) {
        return requirementRepository.findByClientClientId(clientId).stream()
                .map(requirement -> {
                    RequirementResponse response = requirementMapper.toResponse(requirement);
                    response.totalProposals = proposalRepository.countByRequirementId(requirement.getId());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public RequirementResponse getRequirementById(Long requirementId, Long clientId) {
        Requirement r = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
        if (!r.getClient().getClientId().equals(clientId))
            throw new SecurityException("Not owner");
        RequirementResponse response = requirementMapper.toResponse(r);
        response.totalProposals = proposalRepository.countByRequirementId(r.getId());
        return response;
    }

    @Override
    public RequirementResponse getRequirementDetails(Long requirementId) {
        Requirement r = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
        RequirementResponse response = requirementMapper.toResponse(r);
        response.totalProposals = proposalRepository.countByRequirementId(r.getId());
        return response;
    }

    @Override
    public void closeRequirement(Long requirementId, Long clientId) {
        Requirement r = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
        if (!r.getClient().getClientId().equals(clientId))
            throw new SecurityException("Not owner");
        r.setStatus(com.project.freelance.freelancing_platform.requirement.RequirementStatus.CLOSED);
        requirementRepository.save(r);
    }
}
