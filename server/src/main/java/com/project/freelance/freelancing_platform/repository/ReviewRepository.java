package com.project.freelance.freelancing_platform.repository;

import com.project.freelance.freelancing_platform.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.freelancer.freelancerId = :freelancerId AND r.rating IS NOT NULL")
    Double findAverageRatingByFreelancerId(@Param("freelancerId") Long freelancerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.freelancer.freelancerId = :freelancerId AND r.rating IS NOT NULL")
    Long countByFreelancerIdWithRating(@Param("freelancerId") Long freelancerId);

    List<Review> findTop5ByFreelancerFreelancerIdOrderByCreatedAtDesc(Long freelancerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.rating IS NOT NULL")
    Double findAverageRating();

    @Query("SELECT COUNT(r) FROM Review r WHERE r.rating IS NOT NULL")
    Long countAllWithRating();
}
