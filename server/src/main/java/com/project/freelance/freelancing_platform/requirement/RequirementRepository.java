package com.project.freelance.freelancing_platform.requirement;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequirementRepository extends JpaRepository<Requirement, Long> {
    Page<Requirement> findByStatus(RequirementStatus status, Pageable pageable);

    List<Requirement> findByClientClientId(Long clientId);
}
