package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.AnimalOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnimalOrderRepository extends JpaRepository<AnimalOrder, Integer> {
}
