package com.animalphidia.My_backend.controller;

import com.animalphidia.My_backend.model.User;
import com.animalphidia.My_backend.repository.UserRepository;
import com.animalphidia.My_backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    // ✅ ADD ONLY THIS METHOD - Simple test endpoint
    @GetMapping("/simple")
    public ResponseEntity<?> simpleTest() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Test endpoint is working!");
        response.put("status", "OK");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    // ✅ YOUR EXISTING CODE BELOW - DON'T TOUCH
    @GetMapping("/email/send-test")
    public ResponseEntity<?> sendTestEmail(@RequestParam String email) {
        try {
            // Create a test user
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setEmail(email);
            testUser.setVerificationToken(UUID.randomUUID().toString());

            // Send test email
            emailService.sendVerificationEmail(testUser);

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Test email sent to: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send email: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/email/check-config")
    public ResponseEntity<?> checkEmailConfig() {
        Map<String, Object> response = new HashMap<>();

        try {
            response.put("status", "Email service configured");
            response.put("service", "Gmail SMTP");
            response.put("note", "Check if app password is correctly set in application.properties");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "Email service NOT configured");
            response.put("error", e.getMessage());
            response.put("solution", "Add Gmail app password to application.properties");
            return ResponseEntity.ok(response);
        }
    }
}