package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.ConservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConservationStatusRepository extends JpaRepository<ConservationStatus, Integer> {
}