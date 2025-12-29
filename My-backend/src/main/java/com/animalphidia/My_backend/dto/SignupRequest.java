package com.animalphidia.My_backend.dto;

import jakarta.validation.constraints.*;

public class SignupRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    public String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    public String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    public String password;

    @NotBlank(message = "Password confirmation is required")
    public String passwordConfirm;

    public String firstName;

    public String lastName;
}