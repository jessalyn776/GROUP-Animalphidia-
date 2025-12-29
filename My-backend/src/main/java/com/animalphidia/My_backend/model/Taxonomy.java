package com.animalphidia.My_backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "taxonomy")
public class Taxonomy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "kingdom", length = 100)
    private String kingdom;

    @Column(name = "phylum", length = 100)
    private String phylum;

    @Column(name = "class_name", length = 100)
    private String className;

    @Column(name = "order_name", length = 100)
    private String orderName;

    @Column(name = "family", length = 100)
    private String family;

    @Column(name = "genus", length = 100)
    private String genus;

    @Column(name = "species", length = 100)
    private String species;

    @Column(name = "common_names", length = 500)
    private String commonNames;

    @Column(name = "evolutionary_history", columnDefinition = "LONGTEXT")
    private String evolutionaryHistory;

    @Column(name = "related_species", columnDefinition = "LONGTEXT")
    private String relatedSpecies;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getKingdom() { return kingdom; }
    public void setKingdom(String kingdom) { this.kingdom = kingdom; }

    public String getPhylum() { return phylum; }
    public void setPhylum(String phylum) { this.phylum = phylum; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getOrderName() { return orderName; }
    public void setOrderName(String orderName) { this.orderName = orderName; }

    public String getFamily() { return family; }
    public void setFamily(String family) { this.family = family; }

    public String getGenus() { return genus; }
    public void setGenus(String genus) { this.genus = genus; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getCommonNames() { return commonNames; }
    public void setCommonNames(String commonNames) { this.commonNames = commonNames; }

    public String getEvolutionaryHistory() { return evolutionaryHistory; }
    public void setEvolutionaryHistory(String evolutionaryHistory) {
        this.evolutionaryHistory = evolutionaryHistory;
    }

    public String getRelatedSpecies() { return relatedSpecies; }
    public void setRelatedSpecies(String relatedSpecies) {
        this.relatedSpecies = relatedSpecies;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
