package com.animalphidia.My_backend.controller;

import com.animalphidia.My_backend.dto.AnimalDTO;
import com.animalphidia.My_backend.service.AnimalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SearchController {

    @Autowired
    private AnimalService animalService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AnimalDTO> results = animalService.searchAnimals(keyword, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("keyword", keyword);
            response.put("results", results.getContent());
            response.put("totalResults", results.getTotalElements());
            response.put("totalPages", results.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/advanced")
    public ResponseEntity<Map<String, Object>> advancedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String conservationStatus,
            @RequestParam(required = false) String island,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Map<String, Object> results = new HashMap<>();

            if (keyword != null && !keyword.isEmpty()) {
                Pageable pageable = PageRequest.of(page, size);
                Page<AnimalDTO> searchResults = animalService.searchAnimals(keyword, pageable);
                results.put("byKeyword", searchResults.getContent());
            }

            if (region != null && !region.isEmpty()) {
                List<AnimalDTO> regionResults = animalService.getAnimalsByRegion(region);
                results.put("byRegion", regionResults);
            }

            if (conservationStatus != null && !conservationStatus.isEmpty()) {
                List<AnimalDTO> statusResults = animalService.getAnimalsByConservationStatus(conservationStatus);
                results.put("byConservationStatus", statusResults);
            }

            if (island != null && !island.isEmpty()) {
                List<AnimalDTO> islandResults = animalService.getAnimalsByIsland(island);
                results.put("byIsland", islandResults);
            }

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/by-region/{region}")
    public ResponseEntity<Map<String, Object>> searchByRegion(
            @PathVariable String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            List<AnimalDTO> results = animalService.getAnimalsByRegion(region);

            Map<String, Object> response = new HashMap<>();
            response.put("region", region);
            response.put("results", results);
            response.put("count", results.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/by-conservation-status/{status}")
    public ResponseEntity<Map<String, Object>> searchByConservationStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            List<AnimalDTO> results = animalService.getAnimalsByConservationStatus(status);

            Map<String, Object> response = new HashMap<>();
            response.put("conservationStatus", status);
            response.put("results", results);
            response.put("count", results.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/by-island/{island}")
    public ResponseEntity<Map<String, Object>> searchByIsland(
            @PathVariable String island,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            List<AnimalDTO> results = animalService.getAnimalsByIsland(island);

            Map<String, Object> response = new HashMap<>();
            response.put("island", island);
            response.put("results", results);
            response.put("count", results.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}