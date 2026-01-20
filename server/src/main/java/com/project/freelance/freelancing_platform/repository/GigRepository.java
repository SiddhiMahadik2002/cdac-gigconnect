package com.project.freelance.freelancing_platform.repository;

import com.project.freelance.freelancing_platform.model.Gig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GigRepository extends JpaRepository<Gig, Long> {
}
