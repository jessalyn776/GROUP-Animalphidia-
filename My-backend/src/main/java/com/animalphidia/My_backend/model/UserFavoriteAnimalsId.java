package com.animalphidia.My_backend.model;

import java.io.Serializable;
import java.util.Objects;

public class UserFavoriteAnimalsId implements Serializable {
    private Integer userId;
    private Integer animalId;

    public UserFavoriteAnimalsId() {}

    public UserFavoriteAnimalsId(Integer userId, Integer animalId) {
        this.userId = userId;
        this.animalId = animalId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserFavoriteAnimalsId that = (UserFavoriteAnimalsId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(animalId, that.animalId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, animalId);
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getAnimalId() { return animalId; }
    public void setAnimalId(Integer animalId) { this.animalId = animalId; }
}