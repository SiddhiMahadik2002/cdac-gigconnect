package com.project.freelance.freelancing_platform.dto;

public class RegisterRequest {
    public String email;
    public String password;
    public String firstName;
    public String lastName;
    public String phoneNumber;
    // role should be either "CLIENT" or "FREELANCER"; default FREELANCER
    public String role;

    // Freelancer specific fields
    public String title;
    public String description;
}
