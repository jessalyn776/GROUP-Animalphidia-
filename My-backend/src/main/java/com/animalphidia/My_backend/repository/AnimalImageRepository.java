package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.AnimalImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalImageRepository extends JpaRepository<AnimalImage, Integer> {

    // ✅ CORRECT: animal_id is direct column in AnimalImage entity
    List<AnimalImage> findByAnimalId(Integer animalId);

    List<AnimalImage> findByAnimalIdAndImageType(Integer animalId, AnimalImage.ImageType imageType);

    Page<AnimalImage> findByAnimalId(Integer animalId, Pageable pageable);

    List<AnimalImage> findByIsVerifiedTrue();
}