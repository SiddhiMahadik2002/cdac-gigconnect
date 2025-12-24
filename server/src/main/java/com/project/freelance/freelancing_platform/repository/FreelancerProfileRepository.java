package com.project.freelance.freelancing_platform.repository;

import com.project.freelance.freelancing_platform.model.FreelancerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FreelancerProfileRepository extends JpaRepository<FreelancerProfile, Long> {
}
