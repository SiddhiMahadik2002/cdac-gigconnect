package com.project.freelance.freelancing_platform.repository;

import com.project.freelance.freelancing_platform.model.GigImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GigImageRepository extends JpaRepository<GigImage, Long> {
    List<GigImage> findByGigIdOrderByDisplayOrder(Long gigId);
}
