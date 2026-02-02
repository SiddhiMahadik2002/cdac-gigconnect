package com.project.freelance.freelancing_platform.dto;

public class MetaResponse {
    public long activeFreelancers;
    public long projectsCompleted;
    public Double averageRating;
    public Long totalReviews;

    public MetaResponse() {
    }

    public MetaResponse(long activeFreelancers, long projectsCompleted) {
        this.activeFreelancers = activeFreelancers;
        this.projectsCompleted = projectsCompleted;
    }

    public MetaResponse(long activeFreelancers, long projectsCompleted, Double averageRating, Long totalReviews) {
        this.activeFreelancers = activeFreelancers;
        this.projectsCompleted = projectsCompleted;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }
}
