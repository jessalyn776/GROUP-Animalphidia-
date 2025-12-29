package com.animalphidia.My_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Animalphidia Backend API");
        response.put("version", "1.0.0");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> status() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "HEALTHY");
        response.put("message", "Backend service is running smoothly");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("applicationName", "Animalphidia");
        response.put("description", "Philippine Animal Encyclopedia Backend API");
        response.put("version", "1.0.0");
        response.put("author", "Development Team");
        response.put("endpoints", new String[]{
                "/api/animals",
                "/api/auth",
                "/api/users",
                "/api/taxonomy",
                "/api/health"
        });
        return ResponseEntity.ok(response);
    }
}
