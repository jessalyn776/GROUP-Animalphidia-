package com.animalphidia.My_backend.service;

import com.animalphidia.My_backend.model.*;
import com.animalphidia.My_backend.repository.AnimalVerificationWorkflowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VerificationWorkflowService {

    @Autowired
    private AnimalVerificationWorkflowRepository workflowRepository;

    @Autowired
    private AnimalService animalService;

    @Autowired
    private UserService userService;

    public AnimalVerificationWorkflow createSubmission(Integer animalId, Integer submittedBy) {
        AnimalVerificationWorkflow workflow = new AnimalVerificationWorkflow();
        workflow.setAnimalId(animalId);
        workflow.setSubmittedBy(submittedBy);
        workflow.setSubmittedAt(LocalDateTime.now());
        workflow.setModerationStatus(AnimalVerificationWorkflow.ModerationStatus.PENDING);
        workflow.setAdminStatus(AnimalVerificationWorkflow.AdminStatus.PENDING);
        workflow.setFinalStatus(AnimalVerificationWorkflow.FinalStatus.PENDING);

        return workflowRepository.save(workflow);
    }

    public AnimalVerificationWorkflow moderatorFilter(Integer animalId, String notes, boolean isFactual) {
        Optional<AnimalVerificationWorkflow> optional = workflowRepository.findByAnimalId(animalId);
        if (optional.isEmpty()) {
            throw new IllegalArgumentException("Submission not found for animal ID: " + animalId);
        }

        AnimalVerificationWorkflow workflow = optional.get();
        Integer currentUserId = userService.getCurrentUserId();

        if (currentUserId == null) {
            throw new IllegalStateException("User not authenticated");
        }

        workflow.setModeratorId(currentUserId);
        workflow.setModeratedAt(LocalDateTime.now());

        if (isFactual) {
            workflow.setModerationStatus(AnimalVerificationWorkflow.ModerationStatus.FILTERED);
            workflow.setModerationNotes(notes != null ? notes : "Marked as factual by moderator");
        } else {
            workflow.setModerationStatus(AnimalVerificationWorkflow.ModerationStatus.REJECTED);
            workflow.setFinalStatus(AnimalVerificationWorkflow.FinalStatus.REJECTED);
            workflow.setModerationNotes(notes != null ? notes : "Rejected by moderator");

            // Call the rejectAnimal method
            animalService.rejectAnimal(animalId, "Rejected by moderator: " + (notes != null ? notes : "Not factual"));
        }

        return workflowRepository.save(workflow);
    }

    public AnimalVerificationWorkflow adminApprove(Integer animalId, String notes) {
        Optional<AnimalVerificationWorkflow> optional = workflowRepository.findByAnimalId(animalId);
        if (optional.isEmpty()) {
            throw new IllegalArgumentException("Submission not found for animal ID: " + animalId);
        }

        AnimalVerificationWorkflow workflow = optional.get();

        if (workflow.getModerationStatus() != AnimalVerificationWorkflow.ModerationStatus.FILTERED) {
            throw new IllegalArgumentException("Animal must be filtered by moderator first");
        }

        Integer currentUserId = userService.getCurrentUserId();
        if (currentUserId == null) {
            throw new IllegalStateException("User not authenticated");
        }

        workflow.setAdminId(currentUserId);
        workflow.setAdminReviewedAt(LocalDateTime.now());
        workflow.setAdminStatus(AnimalVerificationWorkflow.AdminStatus.APPROVED);
        workflow.setFinalStatus(AnimalVerificationWorkflow.FinalStatus.APPROVED);
        workflow.setAdminNotes(notes != null ? notes : "Approved by admin");

        // Verify the animal
        animalService.verifyAnimal(animalId);

        return workflowRepository.save(workflow);
    }

    public AnimalVerificationWorkflow adminReject(Integer animalId, String reason) {
        Optional<AnimalVerificationWorkflow> optional = workflowRepository.findByAnimalId(animalId);
        if (optional.isEmpty()) {
            throw new IllegalArgumentException("Submission not found for animal ID: " + animalId);
        }

        AnimalVerificationWorkflow workflow = optional.get();

        if (workflow.getModerationStatus() != AnimalVerificationWorkflow.ModerationStatus.FILTERED) {
            throw new IllegalArgumentException("Animal must be filtered by moderator first");
        }

        Integer currentUserId = userService.getCurrentUserId();
        if (currentUserId == null) {
            throw new IllegalStateException("User not authenticated");
        }

        workflow.setAdminId(currentUserId);
        workflow.setAdminReviewedAt(LocalDateTime.now());
        workflow.setAdminStatus(AnimalVerificationWorkflow.AdminStatus.REJECTED);
        workflow.setFinalStatus(AnimalVerificationWorkflow.FinalStatus.REJECTED);
        workflow.setAdminNotes(reason != null ? reason : "Rejected by admin");

        // Reject the animal
        animalService.rejectAnimal(animalId, "Rejected by admin: " + (reason != null ? reason : "No reason provided"));

        return workflowRepository.save(workflow);
    }

    public Page<AnimalVerificationWorkflow> getPendingSubmissions(Pageable pageable) {
        return workflowRepository.findByModerationStatus(
                AnimalVerificationWorkflow.ModerationStatus.PENDING,
                pageable
        );
    }

    public Page<AnimalVerificationWorkflow> getFilteredSubmissions(Pageable pageable) {
        return workflowRepository.findByModerationStatus(
                AnimalVerificationWorkflow.ModerationStatus.FILTERED,
                pageable
        );
    }

    public List<AnimalVerificationWorkflow> getUserSubmissions(Integer userId) {
        return workflowRepository.findBySubmittedBy(userId);
    }

    public long countPendingSubmissions() {
        return workflowRepository.countByModerationStatus(AnimalVerificationWorkflow.ModerationStatus.PENDING);
    }

    public long countFilteredSubmissions() {
        return workflowRepository.countByModerationStatus(AnimalVerificationWorkflow.ModerationStatus.FILTERED);
    }
}
