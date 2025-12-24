package com.project.freelance.freelancing_platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "freelancer_profiles")
public class FreelancerProfile {
    @Id
    private Long freelancerId; // FK to users.user_id

    @OneToOne
    @MapsId
    @JoinColumn(name = "freelancer_id")
    private User user;

    private String title;
    @Column(length = 2000)
    private String description;

    // Additional fields can be added later

    public Long getFreelancerId() {
        return freelancerId;
    }

    public void setFreelancerId(Long freelancerId) {
        this.freelancerId = freelancerId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
