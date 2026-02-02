package com.project.freelance.freelancing_platform.service;

import com.project.freelance.freelancing_platform.dto.GigRequest;
import com.project.freelance.freelancing_platform.model.FreelancerProfile;
import com.project.freelance.freelancing_platform.model.Gig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface GigService {
    Gig createGig(Long freelancerId, GigRequest req);

    Gig updateGig(Long freelancerId, Long gigId, GigRequest req);

    void softDeleteGig(Long freelancerId, Long gigId);

    Gig getGig(Long id);

    Page<Gig> getGigsByFreelancer(Long freelancerId, Pageable pageable);

    Page<Gig> searchGigs(String search, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice,
            Pageable pageable);
}
