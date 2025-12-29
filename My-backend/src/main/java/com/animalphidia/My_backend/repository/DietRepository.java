package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.Diet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DietRepository extends JpaRepository<Diet, Integer> {
}