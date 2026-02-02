package com.project.freelance.freelancing_platform.dto;

import java.util.List;

public class FreelancerProfileRequest {
    public String title;
    // accept either 'description' or 'bio' from clients
    public String description;
    public String bio;

    // frontend may send linkedinUrl / githubUrl / portfolioUrl
    public String linkedin;
    public String linkedinUrl;
    public String github;
    public String githubUrl;
    public String portfolio;
    public String portfolioUrl;

    // accept skills as array from client; controller will join into a stored string
    public List<String> skills;

    // frontend may send fullName instead of separate first/last names
    public String fullName;

    public String getEffectiveDescription() {
        return (description != null && !description.isBlank()) ? description : bio;
    }

    public String getEffectiveLinkedin() {
        return (linkedin != null && !linkedin.isBlank()) ? linkedin : linkedinUrl;
    }

    public String getEffectiveGithub() {
        return (github != null && !github.isBlank()) ? github : githubUrl;
    }

    public String getEffectivePortfolio() {
        return (portfolio != null && !portfolio.isBlank()) ? portfolio : portfolioUrl;
    }

    public String getFirstNameFromFullName() {
        if (fullName == null)
            return null;
        String s = fullName.trim();
        if (s.isEmpty())
            return null;
        String[] parts = s.split("\\s+");
        return parts.length > 0 ? parts[0] : s;
    }

    public String getLastNameFromFullName() {
        if (fullName == null)
            return null;
        String s = fullName.trim();
        if (s.isEmpty())
            return null;
        String[] parts = s.split("\\s+");
        if (parts.length <= 1)
            return null;
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i < parts.length; i++) {
            if (sb.length() > 0)
                sb.append(' ');
            sb.append(parts[i]);
        }
        return sb.toString();
    }
}
