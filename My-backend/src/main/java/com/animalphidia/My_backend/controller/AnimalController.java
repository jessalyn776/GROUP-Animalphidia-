package com.animalphidia.My_backend.controller;

import com.animalphidia.My_backend.dto.AnimalDTO;
import com.animalphidia.My_backend.service.AnimalService;
import com.animalphidia.My_backend.service.VerificationWorkflowService;
import com.animalphidia.My_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/animals")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnimalController {

    @Autowired
    private AnimalService animalService;

    @Autowired
    private VerificationWorkflowService workflowService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllAnimals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Integer userId = userService.getCurrentUserId();
            Pageable pageable = PageRequest.of(page, size);
            Page<AnimalDTO> animals;

            if (userId != null && userService.isContributor()) {
                animals = animalService.getAllAnimalsForContributor(pageable, userId);
            } else {
                animals = animalService.getAllAnimals(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("content", animals.getContent());
            response.put("totalPages", animals.getTotalPages());
            response.put("totalElements", animals.getTotalElements());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to load animals");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> createAnimal(@Valid @RequestBody AnimalDTO animalDTO) {
        try {
            Integer userId = userService.getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }

            AnimalDTO createdAnimal = animalService.createAnimal(animalDTO, userId);

            workflowService.createSubmission(createdAnimal.id, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Animal submitted successfully!");
            response.put("animal", createdAnimal);
            response.put("status", "PENDING_VERIFICATION");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to submit animal");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<?> getMySubmissions() {
        try {
            Integer userId = userService.getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }

            List<?> submissions = workflowService.getUserSubmissions(userId);

            return ResponseEntity.ok(Map.of(
                    "submissions", submissions,
                    "count", submissions.size()
            ));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to load submissions");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<Page<AnimalDTO>> getFeaturedAnimals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AnimalDTO> animals = animalService.getFeaturedAnimals(pageable);
            return ResponseEntity.ok(animals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalDTO> getAnimalById(@PathVariable Integer id) {
        try {
            Optional<AnimalDTO> animal = animalService.getAnimalById(id);
            return animal.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AnimalDTO>> searchAnimals(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AnimalDTO> animals = animalService.searchAnimals(keyword, pageable);
            return ResponseEntity.ok(animals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/filter/region/{region}")
    public ResponseEntity<List<AnimalDTO>> getAnimalsByRegion(@PathVariable String region) {
        try {
            List<AnimalDTO> animals = animalService.getAnimalsByRegion(region);
            return ResponseEntity.ok(animals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/filter/island/{island}")
    public ResponseEntity<List<AnimalDTO>> getAnimalsByIsland(@PathVariable String island) {
        try {
            List<AnimalDTO> animals = animalService.getAnimalsByIsland(island);
            return ResponseEntity.ok(animals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/filter/status/{status}")
    public ResponseEntity<List<AnimalDTO>> getAnimalsByConservationStatus(@PathVariable String status) {
        try {
            List<AnimalDTO> animals = animalService.getAnimalsByConservationStatus(status);
            return ResponseEntity.ok(animals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnimalDTO> updateAnimal(@PathVariable Integer id, @Valid @RequestBody AnimalDTO animalDTO) {
        try {
            AnimalDTO updatedAnimal = animalService.updateAnimal(id, animalDTO);
            return ResponseEntity.ok(updatedAnimal);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnimal(@PathVariable Integer id) {
        try {
            animalService.deleteAnimal(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<AnimalDTO> verifyAnimal(@PathVariable Integer id) {
        try {
            AnimalDTO verifiedAnimal = animalService.verifyAnimal(id);
            return ResponseEntity.ok(verifiedAnimal);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
