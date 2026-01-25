package com.project.freelance.freelancing_platform.dto;

public class RegisterRequest {
    public String email;
    public String password;
    public String firstName;
    public String lastName;
    public String fullName; // UI sends this, will be split into firstName/lastName
    public String phoneNumber;
    // role should be either "CLIENT" or "FREELANCER"; default FREELANCER
    public String role;

    // Freelancer specific fields
    public String title;
    public String description;

    // Helper method to get firstName from fullName if firstName is null
    public String getFirstName() {
        if (firstName != null)
            return firstName;
        if (fullName != null) {
            String[] parts = fullName.trim().split("\\s+", 2);
            return parts.length > 0 ? parts[0] : "";
        }
        return null;
    }

    // Helper method to get lastName from fullName if lastName is null
    public String getLastName() {
        if (lastName != null)
            return lastName;
        if (fullName != null) {
            String[] parts = fullName.trim().split("\\s+", 2);
            return parts.length > 1 ? parts[1] : "";
        }
        return null;
    }
}
