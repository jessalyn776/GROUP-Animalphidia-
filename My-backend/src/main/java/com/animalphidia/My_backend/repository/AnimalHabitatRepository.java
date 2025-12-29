package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.AnimalHabitat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalHabitatRepository extends JpaRepository<AnimalHabitat, Integer> {

    List<AnimalHabitat> findByAnimalId(Integer animalId);

    List<AnimalHabitat> findByHabitatId(Integer habitatId);

    void deleteByAnimalId(Integer animalId);
}