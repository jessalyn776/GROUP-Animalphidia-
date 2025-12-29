package com.animalphidia.My_backend.controller;

import com.animalphidia.My_backend.dto.AnimalDTO;
import com.animalphidia.My_backend.service.AnimalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicController {

    @Autowired
    private AnimalService animalService;

    @GetMapping("/animals/limited")
    public ResponseEntity<?> getLimitedAnimals() {
        try {
            var pageable = PageRequest.of(0, 20);
            var animalsPage = animalService.getFeaturedAnimals(pageable);
            List<AnimalDTO> animals = animalsPage.getContent();

            Map<String, Object> response = new HashMap<>();
            response.put("animals", animals);
            response.put("count", animals.size());
            response.put("message", "Showing 20 featured animals. Sign up as Contributor to see all animals and contribute!");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to load animals");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/animals/search")
    public ResponseEntity<?> searchAnimals(@RequestParam String keyword) {
        try {
            var pageable = PageRequest.of(0, 10);
            var animalsPage = animalService.searchAnimals(keyword, pageable);
            List<AnimalDTO> animals = animalsPage.getContent();

            Map<String, Object> response = new HashMap<>();
            response.put("results", animals);
            response.put("count", animals.size());
            response.put("keyword", keyword);
            response.put("note", "Limited to 10 results. Register as Contributor for full access");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Search failed");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/animals/{id}")
    public ResponseEntity<?> getAnimalById(@PathVariable Integer id) {
        try {
            var animalOpt = animalService.getAnimalById(id);
            if (animalOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "error", "Animal not found"
                ));
            }

            AnimalDTO animal = animalOpt.get();

            if (!animal.isVerified || !animal.active) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "This animal is not available for public viewing",
                        "message", "Register as Contributor to access all content"
                ));
            }

            return ResponseEntity.ok(animal);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to load animal");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/animals/featured")
    public ResponseEntity<?> getFeaturedAnimals() {
        try {
            var pageable = PageRequest.of(0, 6);
            var animalsPage = animalService.getFeaturedAnimals(pageable);
            List<AnimalDTO> animals = animalsPage.getContent();

            Map<String, Object> response = new HashMap<>();
            response.put("featured", animals);
            response.put("count", animals.size());
            response.put("message", "Featured animals of the day");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to load featured animals");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
