package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.AnimalVerificationWorkflow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnimalVerificationWorkflowRepository extends JpaRepository<AnimalVerificationWorkflow, Integer> {

    Optional<AnimalVerificationWorkflow> findByAnimalId(Integer animalId);

    List<AnimalVerificationWorkflow> findBySubmittedBy(Integer userId);

    List<AnimalVerificationWorkflow> findByModeratorId(Integer moderatorId);

    List<AnimalVerificationWorkflow> findByAdminId(Integer adminId);

    Page<AnimalVerificationWorkflow> findByModerationStatus(AnimalVerificationWorkflow.ModerationStatus status, Pageable pageable);

    Page<AnimalVerificationWorkflow> findByAdminStatus(AnimalVerificationWorkflow.AdminStatus status, Pageable pageable);

    Page<AnimalVerificationWorkflow> findByFinalStatus(AnimalVerificationWorkflow.FinalStatus status, Pageable pageable);

    List<AnimalVerificationWorkflow> findByFinalStatus(AnimalVerificationWorkflow.FinalStatus status);

    long countByModerationStatus(AnimalVerificationWorkflow.ModerationStatus status);

    long countByAdminStatus(AnimalVerificationWorkflow.AdminStatus status);

    long countByFinalStatus(AnimalVerificationWorkflow.FinalStatus status);
}
