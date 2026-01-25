package com.project.freelance.freelancing_platform.proposal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    @EntityGraph(attributePaths = { "requirement", "requirement.client", "requirement.client.user", "freelancer" })
    List<Proposal> findByRequirementId(Long requirementId);

    @EntityGraph(attributePaths = { "requirement", "requirement.client", "requirement.client.user", "freelancer" })
    List<Proposal> findByFreelancerFreelancerId(Long freelancerId);

    @EntityGraph(attributePaths = { "requirement", "requirement.client", "requirement.client.user", "freelancer" })
    @Override
    Optional<Proposal> findById(Long id);

    boolean existsByRequirementIdAndFreelancerFreelancerId(Long requirementId, Long freelancerId);

    long countByRequirementId(Long requirementId);
}
