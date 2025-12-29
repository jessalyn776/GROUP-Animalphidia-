package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.Habitat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HabitatRepository extends JpaRepository<Habitat, Integer> {

    Optional<Habitat> findByHabitatName(String habitatName);

    List<Habitat> findByClimateType(String climateType);
}