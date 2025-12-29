package com.animalphidia.My_backend.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    ADMIN("admin"),
    MODERATOR("moderator"),
    CONTRIBUTOR("contributor"),
    VIEWER("viewer");

    private final String dbValue;

    UserRole(String dbValue) {
        this.dbValue = dbValue;
    }

    @JsonValue
    public String getDbValue() {
        return dbValue;
    }

    @Override
    public String toString() {
        return dbValue; // Returns lowercase "admin", "viewer", etc for database
    }

    public static UserRole fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return VIEWER;
        }

        // Try to match by database value first (case-insensitive)
        String lowerValue = value.toLowerCase();
        for (UserRole role : values()) {
            if (role.dbValue.equals(lowerValue)) {
                return role;
            }
        }

        // Try to match by enum name (uppercase)
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return VIEWER; // Default to VIEWER if no match
        }
    }
}