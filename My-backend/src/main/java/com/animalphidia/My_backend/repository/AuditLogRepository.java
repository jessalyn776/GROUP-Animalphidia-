package com.animalphidia.My_backend.repository;

import com.animalphidia.My_backend.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserId(Long userId);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findByEntityType(String entityType);

    Page<AuditLog> findByUserId(Long userId, Pageable pageable);

    List<AuditLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<AuditLog> findByUserIdAndAction(Long userId, String action);
}
