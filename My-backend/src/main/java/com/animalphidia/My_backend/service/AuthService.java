package com.animalphidia.My_backend.service;

import com.animalphidia.My_backend.config.JwtUtil;
import com.animalphidia.My_backend.dto.AuthResponse;
import com.animalphidia.My_backend.dto.LoginRequest;
import com.animalphidia.My_backend.dto.SignupRequest;
import com.animalphidia.My_backend.model.User;
import com.animalphidia.My_backend.model.UserRole;
import com.animalphidia.My_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @PostConstruct
    public void init() {
        log.info("🔧 AuthService initialized");
        try {
            long userCount = userRepository.count();
            log.info("✅ Database connected. Total users: {}", userCount);
        } catch (Exception e) {
            log.error("❌ Database connection failed: {}", e.getMessage());
        }
    }

    public AuthResponse register(SignupRequest signupRequest) {
        log.info("🔍 Starting registration for: {}", signupRequest.email);
        log.info("Username: {}, Email: {}", signupRequest.username, signupRequest.email);

        // Check password match
        if (!signupRequest.password.equals(signupRequest.passwordConfirm)) {
            log.error("❌ Password mismatch for: {}", signupRequest.email);
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Check email
        try {
            boolean emailExists = userRepository.existsByEmailIgnoreCase(signupRequest.email);
            if (emailExists) {
                log.error("❌ Email already exists: {}", signupRequest.email);
                throw new IllegalArgumentException("Email already registered");
            }
        } catch (Exception e) {
            log.error("❌ Error checking email existence: {}", e.getMessage());
            throw new IllegalArgumentException("Error checking email: " + e.getMessage());
        }

        // Check username
        try {
            boolean usernameExists = userRepository.existsByUsernameIgnoreCase(signupRequest.username);
            if (usernameExists) {
                log.error("❌ Username already exists: {}", signupRequest.username);
                throw new IllegalArgumentException("Username already taken");
            }
        } catch (Exception e) {
            log.error("❌ Error checking username existence: {}", e.getMessage());
            throw new IllegalArgumentException("Error checking username: " + e.getMessage());
        }

        log.info("✅ Validation passed for: {}", signupRequest.email);

        // Create user
        User user = new User();
        user.setUsername(signupRequest.username);
        user.setEmail(signupRequest.email);

        String encodedPassword = passwordEncoder.encode(signupRequest.password);
        user.setPassword(encodedPassword);

        user.setFirstName(signupRequest.firstName);
        user.setLastName(signupRequest.lastName);

        // ✅ FIXED: Only set role using enum
        user.setRole(UserRole.VIEWER); // Default role for all new users

        user.setEmailVerified(false);
        user.setAccountStatus(true);
        user.setActive(true);
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setPasswordResetToken(null);

        log.info("📝 Saving user to database...");

        try {
            User savedUser = userRepository.save(user);
            log.info("✅ User saved successfully. ID: {}", savedUser.getId());

            // Send verification email
            try {
                emailService.sendVerificationEmail(savedUser);
                log.info("📧 Verification email sent to: {}", savedUser.getEmail());
            } catch (Exception e) {
                log.warn("⚠️ Could not send verification email: {}", e.getMessage());
                // Don't fail registration if email fails
            }

            // Generate tokens
            String role = savedUser.getRole().toString(); // Returns "viewer"
            String accessToken = jwtUtil.generateToken(savedUser.getUsername(), role);
            String refreshToken = jwtUtil.generateRefreshToken(savedUser.getUsername());

            AuthResponse response = new AuthResponse();
            response.userId = savedUser.getId();
            response.username = savedUser.getUsername();
            response.email = savedUser.getEmail();
            response.role = role;
            response.accessToken = accessToken;
            response.refreshToken = refreshToken;
            response.message = "Registration successful. Please verify your email.";

            log.info("🎉 Registration completed for: {}", savedUser.getEmail());
            return response;

        } catch (Exception e) {
            log.error("❌ Error saving user to database: {}", e.getMessage());
            e.printStackTrace();
            throw new IllegalArgumentException("Database error: " + e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest loginRequest) {
        log.info("🔍 Login attempt for: {}", loginRequest.getUsername());

        Optional<User> userOptional = userRepository.findByUsernameIgnoreCase(loginRequest.getUsername());

        if (userOptional.isEmpty()) {
            log.warn("❌ Login attempt with non-existent username: {}", loginRequest.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        User user = userOptional.get();

        // Check if account is locked
        if (user.getLockTime() != null && user.getLockTime().plusHours(1).isAfter(LocalDateTime.now())) {
            log.warn("🔒 Account locked for user: {}", user.getUsername());
            throw new IllegalArgumentException("Account is locked. Try again later.");
        }

        // Check password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.warn("❌ Wrong password for user: {}", user.getUsername());

            // Increment failed attempts
            Integer currentAttempts = user.getFailedLoginAttempts();
            user.setFailedLoginAttempts(currentAttempts != null ? currentAttempts + 1 : 1);

            if (user.getFailedLoginAttempts() >= 5) {
                user.setLockTime(LocalDateTime.now());
                log.warn("🔒 Account locked due to multiple failed login attempts: {}", user.getUsername());
            }

            userRepository.save(user);
            throw new IllegalArgumentException("Invalid username or password");
        }

        // Check if email is verified
        if (user.getEmailVerified() == null || !user.getEmailVerified()) {
            log.warn("📧 Email not verified for user: {}", user.getUsername());
            throw new IllegalArgumentException("Please verify your email before logging in");
        }

        // Check account status
        if (user.getAccountStatus() == null || !user.getAccountStatus()) {
            log.warn("🚫 Account not active for user: {}", user.getUsername());
            throw new IllegalArgumentException("Account is not active");
        }

        // Reset failed attempts and update last login
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String role = user.getRole().toString();
        String accessToken = jwtUtil.generateToken(user.getUsername(), role);
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        log.info("✅ User logged in successfully: {}", user.getUsername());

        AuthResponse response = new AuthResponse();
        response.userId = user.getId();
        response.username = user.getUsername();
        response.email = user.getEmail();
        response.role = role;
        response.accessToken = accessToken;
        response.refreshToken = refreshToken;
        response.message = "Login successful";
        return response;
    }

    public void verifyEmail(String token) {
        log.info("🔍 Verifying email with token: {}", token);

        Optional<User> userOptional = userRepository.findByVerificationToken(token);

        if (userOptional.isEmpty()) {
            log.error("❌ Invalid verification token: {}", token);
            throw new IllegalArgumentException("Invalid verification token");
        }

        User user = userOptional.get();
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        log.info("✅ Email verified for user: {}", user.getUsername());
    }

    public void requestPasswordReset(String email) {
        log.info("🔍 Password reset requested for: {}", email);

        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(email);

        if (userOptional.isEmpty()) {
            log.warn("❌ Password reset requested for non-existent email: {}", email);
            throw new IllegalArgumentException("Email not found");
        }

        User user = userOptional.get();
        user.setPasswordResetToken(UUID.randomUUID().toString());
        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(user);
            log.info("✅ Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("❌ Error sending password reset email: {}", e.getMessage());
            throw new IllegalArgumentException("Failed to send reset email");
        }
    }

    public void resetPassword(String token, String newPassword) {
        log.info("🔍 Resetting password with token: {}", token);

        Optional<User> userOptional = userRepository.findByPasswordResetToken(token);

        if (userOptional.isEmpty()) {
            log.error("❌ Invalid or expired reset token: {}", token);
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        User user = userOptional.get();
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        user.setPasswordResetToken(null);
        userRepository.save(user);

        log.info("✅ Password reset successful for user: {}", user.getUsername());
    }

    public AuthResponse refreshToken(String refreshToken) {
        log.info("🔍 Refreshing token");

        if (!jwtUtil.isTokenValid(refreshToken)) {
            log.error("❌ Invalid or expired refresh token");
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String username = jwtUtil.extractUsername(refreshToken);
        Optional<User> userOptional = userRepository.findByUsernameIgnoreCase(username);

        if (userOptional.isEmpty()) {
            log.error("❌ User not found for refresh token: {}", username);
            throw new IllegalArgumentException("User not found");
        }

        User user = userOptional.get();
        String role = user.getRole().toString();
        String newAccessToken = jwtUtil.generateToken(user.getUsername(), role);

        AuthResponse response = new AuthResponse();
        response.userId = user.getId();
        response.username = user.getUsername();
        response.email = user.getEmail();
        response.role = role;
        response.accessToken = newAccessToken;
        response.message = "Token refreshed successfully";

        log.info("✅ Token refreshed for user: {}", user.getUsername());
        return response;
    }
}
