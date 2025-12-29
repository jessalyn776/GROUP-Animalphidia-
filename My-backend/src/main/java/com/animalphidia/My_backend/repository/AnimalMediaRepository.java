package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.AnimalMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalMediaRepository extends JpaRepository<AnimalMedia, Long> {

    // ✅ FIXED: Direct column search
    List<AnimalMedia> findByAnimalId(Integer animalId);

    List<AnimalMedia> findByMediaTypeIgnoreCase(String mediaType);
}