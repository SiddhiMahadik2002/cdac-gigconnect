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

    // Social links
    @Column(name = "linkedin", length = 1024)
    private String linkedin;

    @Column(name = "github", length = 1024)
    private String github;

    @Column(name = "portfolio", length = 1024)
    private String portfolio;

    // Comma or semicolon separated skills string (stored as text)
    @Column(name = "skills", length = 2000)
    private String skills;

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

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(String portfolio) {
        this.portfolio = portfolio;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }
}
