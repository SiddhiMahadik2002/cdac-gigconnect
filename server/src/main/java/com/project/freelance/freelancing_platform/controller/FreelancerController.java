package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.model.FreelancerProfile;
import com.project.freelance.freelancing_platform.repository.FreelancerProfileRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/freelancers")
public class FreelancerController {
    private final FreelancerProfileRepository repo;

    public FreelancerController(FreelancerProfileRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<FreelancerProfile> list() {
        return repo.findAll();
    }
}
