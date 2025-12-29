package com.animalphidia.My_backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class AnimalDTO {
    public Integer id;

    @NotBlank(message = "Common name is required")
    public String commonName;

    public String localName;

    @NotBlank(message = "Scientific name is required")
    public String scientificName;

    // Taxonomy fields
    public Integer speciesId;
    public Integer kingdomId;
    public Integer phylumId;
    public Integer classId;
    public Integer orderId;
    public Integer familyId;
    public Integer genusId;
    public Long taxonomyId;

    // Basic info
    public String description;
    public String characteristics;
    public String habitat;
    public String behavior;
    public String diet;
    public String reproduction;

    // Physical attributes
    public String lifespan;
    public String size;
    public String weight;

    @NotBlank(message = "Conservation status is required")
    public String conservationStatus;

    // Location
    public String region;
    public String province;
    public String island;

    // Status fields
    public Double populationEstimate;
    public String imageUrl;
    public String tags;

    // Conservation flags
    public Boolean isEndangered;
    public Boolean isProtected;

    // Verification flags
    public Boolean verified;  // For bit column
    public Boolean isVerified; // For tinyint column
    public String verificationNotes;
    public Boolean active;

    // Foreign key ids
    public Integer conservationStatusId;
    public Integer dietId;

    // User tracking
    public Integer createdBy;
    public Integer updatedBy;

    // Timestamps
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public AnimalDTO() {}

    // Constructor for basic fields
    public AnimalDTO(String commonName, String scientificName, String description,
                     String characteristics, String habitat, String behavior, String diet,
                     String reproduction, String conservationStatus, String region, String island,
                     Double populationEstimate, String imageUrl, String tags, Boolean verified,
                     Boolean isVerified, Boolean active, LocalDateTime createdAt, LocalDateTime updatedAt,
                     Integer conservationStatusId, Integer dietId) {

        this.commonName = commonName;
        this.scientificName = scientificName;
        this.description = description;
        this.characteristics = characteristics;
        this.habitat = habitat;
        this.behavior = behavior;
        this.diet = diet;
        this.reproduction = reproduction;
        this.conservationStatus = conservationStatus;
        this.region = region;
        this.island = island;
        this.populationEstimate = populationEstimate;
        this.imageUrl = imageUrl;
        this.tags = tags;
        this.verified = verified;
        this.isVerified = isVerified;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.conservationStatusId = conservationStatusId;
        this.dietId = dietId;
    }

    // Full constructor
    public AnimalDTO(String commonName, String localName, String scientificName,
                     Integer speciesId, Integer kingdomId, Integer phylumId, Integer classId,
                     Integer orderId, Integer familyId, Integer genusId, Long taxonomyId,
                     String description, String characteristics, String habitat, String behavior,
                     String diet, String reproduction, String lifespan, String size, String weight,
                     String conservationStatus, String region, String province, String island,
                     Double populationEstimate, String imageUrl, String tags,
                     Boolean isEndangered, Boolean isProtected, Boolean verified,
                     Boolean isVerified, String verificationNotes, Boolean active,
                     Integer conservationStatusId, Integer dietId, Integer createdBy,
                     Integer updatedBy, LocalDateTime createdAt, LocalDateTime updatedAt) {

        this.commonName = commonName;
        this.localName = localName;
        this.scientificName = scientificName;
        this.speciesId = speciesId;
        this.kingdomId = kingdomId;
        this.phylumId = phylumId;
        this.classId = classId;
        this.orderId = orderId;
        this.familyId = familyId;
        this.genusId = genusId;
        this.taxonomyId = taxonomyId;
        this.description = description;
        this.characteristics = characteristics;
        this.habitat = habitat;
        this.behavior = behavior;
        this.diet = diet;
        this.reproduction = reproduction;
        this.lifespan = lifespan;
        this.size = size;
        this.weight = weight;
        this.conservationStatus = conservationStatus;
        this.region = region;
        this.province = province;
        this.island = island;
        this.populationEstimate = populationEstimate;
        this.imageUrl = imageUrl;
        this.tags = tags;
        this.isEndangered = isEndangered;
        this.isProtected = isProtected;
        this.verified = verified;
        this.isVerified = isVerified;
        this.verificationNotes = verificationNotes;
        this.active = active;
        this.conservationStatusId = conservationStatusId;
        this.dietId = dietId;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}