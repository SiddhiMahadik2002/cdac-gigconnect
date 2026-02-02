package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.MetaResponse;
import com.project.freelance.freelancing_platform.repository.FreelancerProfileRepository;
import com.project.freelance.freelancing_platform.repository.OrderRepository;
import com.project.freelance.freelancing_platform.repository.ReviewRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/meta")
public class MetaController {
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    public MetaController(FreelancerProfileRepository freelancerProfileRepository, OrderRepository orderRepository,
            ReviewRepository reviewRepository) {
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public MetaResponse getMeta() {
        long activeFreelancers = freelancerProfileRepository.count();
        long projectsCompleted = orderRepository
                .countByStatus(com.project.freelance.freelancing_platform.model.Order.OrderStatus.COMPLETED);
        Double avg = reviewRepository.findAverageRating();
        Long total = reviewRepository.countAllWithRating();
        return new MetaResponse(activeFreelancers, projectsCompleted, avg != null ? avg : 0.0,
                total != null ? total : 0L);
    }
}
