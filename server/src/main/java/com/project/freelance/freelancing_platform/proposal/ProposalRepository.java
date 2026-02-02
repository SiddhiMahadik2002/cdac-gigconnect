package com.project.freelance.freelancing_platform.proposal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
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

    @Modifying
    @Query("UPDATE Proposal p SET p.status = 'REJECTED' WHERE p.requirement.id = :requirementId AND p.id != :acceptedProposalId AND p.status = 'PENDING'")
    int rejectOtherProposalsForRequirement(@Param("requirementId") Long requirementId, @Param("acceptedProposalId") Long acceptedProposalId);

    @Query("SELECT AVG(p.rating) FROM Proposal p WHERE p.freelancer.freelancerId = :freelancerId AND p.status = com.project.freelance.freelancing_platform.proposal.ProposalStatus.COMPLETED AND p.rating IS NOT NULL")
    Double findAverageRatingByFreelancerId(@Param("freelancerId") Long freelancerId);

    List<Proposal> findTop5ByFreelancerFreelancerIdAndClientFeedbackIsNotNullOrderByCompletedAtDesc(Long freelancerId);

    long countByFreelancerFreelancerIdAndRatingIsNotNull(Long freelancerId);
}
