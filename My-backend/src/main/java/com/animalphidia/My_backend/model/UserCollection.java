package com.animalphidia.My_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_collections", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_collection_name", columnList = "collection_name")
})
public class UserCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotNull(message = "User is required")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @NotBlank(message = "Collection name is required")
    @Column(name = "collection_name", nullable = false, length = 255)
    public String collectionName;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(nullable = false)
    public Boolean isPublic = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    public LocalDateTime updatedAt;

    public UserCollection() {}
}