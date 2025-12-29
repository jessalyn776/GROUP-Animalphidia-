package com.animalphidia.My_backend.converter;

import com.animalphidia.My_backend.model.UserRole;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserRoleConverter implements AttributeConverter<UserRole, String> {

    @Override
    public String convertToDatabaseColumn(UserRole role) {
        if (role == null) {
            return "viewer"; // Default value for database
        }
        return role.toString(); // This calls toString() which returns lowercase
    }

    @Override
    public UserRole convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return UserRole.VIEWER; // Default value when reading from database
        }
        // Use the fromString method to handle both lowercase and uppercase
        return UserRole.fromString(dbData);
    }
}