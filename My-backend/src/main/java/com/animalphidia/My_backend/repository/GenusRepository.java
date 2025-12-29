package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.Genus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenusRepository extends JpaRepository<Genus, Integer> {
}
