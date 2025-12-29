package com.animalphidia.My_backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_favorite_animals")
@IdClass(UserFavoriteAnimalsId.class)
public class UserFavoriteAnimals {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @Id
    @Column(name = "animal_id")
    private Integer animalId;

    @ManyToOne
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "animal_id", insertable = false, updatable = false)
    private Animal animal;

    public UserFavoriteAnimals() {}

    public UserFavoriteAnimals(Integer userId, Integer animalId) {
        this.userId = userId;
        this.animalId = animalId;
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getAnimalId() { return animalId; }
    public void setAnimalId(Integer animalId) { this.animalId = animalId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }
}