package com.animalphidia.My_backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "animal_verification_workflow")
public class AnimalVerificationWorkflow {

    public enum ModerationStatus {
        PENDING, FILTERED, REJECTED
    }

    public enum AdminStatus {
        PENDING, APPROVED, REJECTED
    }

    public enum FinalStatus {
        PENDING, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workflow_id")
    private Integer workflowId;

    @Column(name = "animal_id", nullable = false)
    private Integer animalId;

    @Column(name = "submitted_by", nullable = false)
    private Integer submittedBy;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "moderator_id")
    private Integer moderatorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status")
    private ModerationStatus moderationStatus = ModerationStatus.PENDING;

    @Column(name = "moderation_notes", columnDefinition = "TEXT")
    private String moderationNotes;

    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;

    @Column(name = "admin_id")
    private Integer adminId;

    @Enumerated(EnumType.STRING)
    @Column(name = "admin_status")
    private AdminStatus adminStatus = AdminStatus.PENDING;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "admin_reviewed_at")
    private LocalDateTime adminReviewedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "final_status")
    private FinalStatus finalStatus = FinalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", insertable = false, updatable = false)
    private Animal animal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", insertable = false, updatable = false)
    private User submitter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id", insertable = false, updatable = false)
    private User moderator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", insertable = false, updatable = false)
    private User admin;

    public AnimalVerificationWorkflow() {}

    public AnimalVerificationWorkflow(Integer animalId, Integer submittedBy) {
        this.animalId = animalId;
        this.submittedBy = submittedBy;
    }

    public Integer getWorkflowId() { return workflowId; }
    public void setWorkflowId(Integer workflowId) { this.workflowId = workflowId; }

    public Integer getAnimalId() { return animalId; }
    public void setAnimalId(Integer animalId) { this.animalId = animalId; }

    public Integer getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(Integer submittedBy) { this.submittedBy = submittedBy; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public Integer getModeratorId() { return moderatorId; }
    public void setModeratorId(Integer moderatorId) { this.moderatorId = moderatorId; }

    public ModerationStatus getModerationStatus() { return moderationStatus; }
    public void setModerationStatus(ModerationStatus moderationStatus) {
        this.moderationStatus = moderationStatus;
    }

    public String getModerationNotes() { return moderationNotes; }
    public void setModerationNotes(String moderationNotes) {
        this.moderationNotes = moderationNotes;
    }

    public LocalDateTime getModeratedAt() { return moderatedAt; }
    public void setModeratedAt(LocalDateTime moderatedAt) {
        this.moderatedAt = moderatedAt;
    }

    public Integer getAdminId() { return adminId; }
    public void setAdminId(Integer adminId) { this.adminId = adminId; }

    public AdminStatus getAdminStatus() { return adminStatus; }
    public void setAdminStatus(AdminStatus adminStatus) {
        this.adminStatus = adminStatus;
    }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public LocalDateTime getAdminReviewedAt() { return adminReviewedAt; }
    public void setAdminReviewedAt(LocalDateTime adminReviewedAt) {
        this.adminReviewedAt = adminReviewedAt;
    }

    public FinalStatus getFinalStatus() { return finalStatus; }
    public void setFinalStatus(FinalStatus finalStatus) {
        this.finalStatus = finalStatus;
    }

    public Animal getAnimal() { return animal; }
    public void setAnimal(Animal animal) { this.animal = animal; }

    public User getSubmitter() { return submitter; }
    public void setSubmitter(User submitter) { this.submitter = submitter; }

    public User getModerator() { return moderator; }
    public void setModerator(User moderator) { this.moderator = moderator; }

    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }
}
