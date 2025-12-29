package com.animalphidia.My_backend.dto;

public class AuthResponse {
    public Integer userId;
    public String username;
    public String email;
    public String role;
    public String accessToken;
    public String refreshToken;
    public String message;

    // Default constructor
    public AuthResponse() {}

    // Full constructor
    public AuthResponse(Integer userId, String username, String email, String role,
                        String accessToken, String refreshToken, String message) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.message = message;
    }
}