package com.project.freelance.freelancing_platform.mapper;

import com.project.freelance.freelancing_platform.dto.ProposalResponse;
import com.project.freelance.freelancing_platform.proposal.Proposal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ProposalMapper {
    @Mapping(source = "requirement.id", target = "requirementId")
    @Mapping(source = "freelancer.freelancerId", target = "freelancerId")
    @Mapping(source = "requirement.title", target = "requirementTitle")
    @Mapping(source = "requirement.description", target = "requirementDescription")
    @Mapping(source = "requirement.client.clientId", target = "clientId")
    @Mapping(target = "clientName", expression = "java(getClientName(p))")
    ProposalResponse toResponse(Proposal p);

    default String getClientName(Proposal p) {
        if (p.getRequirement() != null &&
                p.getRequirement().getClient() != null &&
                p.getRequirement().getClient().getUser() != null) {
            var user = p.getRequirement().getClient().getUser();
            String firstName = user.getFirstName() != null ? user.getFirstName() : "";
            String lastName = user.getLastName() != null ? user.getLastName() : "";
            return (firstName + " " + lastName).trim();
        }
        return "Unknown";
    }
}
