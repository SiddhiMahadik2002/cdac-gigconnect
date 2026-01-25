package com.project.freelance.freelancing_platform.service;

import com.project.freelance.freelancing_platform.dto.RequirementRequest;
import com.project.freelance.freelancing_platform.dto.RequirementResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RequirementService {
    RequirementResponse createRequirement(RequirementRequest req, Long clientId);

    Page<RequirementResponse> listRequirementsForFreelancers(Pageable pageable);

    List<RequirementResponse> listClientRequirements(Long clientId);

    RequirementResponse getRequirementById(Long requirementId, Long clientId);

    RequirementResponse getRequirementDetails(Long requirementId);

    void closeRequirement(Long requirementId, Long clientId);
}
