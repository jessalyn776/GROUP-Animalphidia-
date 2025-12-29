package com.animalphidia.My_backend.controller;

import com.animalphidia.My_backend.model.Notification;
import com.animalphidia.My_backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // For now, use a default user ID (in production, get from security context)
            Long userId = 1L; // Replace with actual user ID from security context

            Pageable pageable = PageRequest.of(page, size);
            Page<Notification> notifications = notificationRepository.findByUserId(userId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notifications.getContent());
            response.put("totalPages", notifications.getTotalPages());
            response.put("totalElements", notifications.getTotalElements());
            response.put("unreadCount", notificationRepository.countByUserIdAndIsReadFalse(userId));
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch notifications");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Long userId = 1L; // Replace with actual user ID

            Pageable pageable = PageRequest.of(page, size);
            Page<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(userId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notifications.getContent());
            response.put("totalPages", notifications.getTotalPages());
            response.put("totalElements", notifications.getTotalElements());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch unread notifications");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            Notification notification = notificationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification marked as read");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Notification not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update notification");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        try {
            Long userId = 1L; // Replace with actual user ID

            notificationRepository.findByUserIdAndIsReadFalse(userId)
                    .forEach(notification -> {
                        notification.setIsRead(true);
                        notification.setReadAt(LocalDateTime.now());
                        notificationRepository.save(notification);
                    });

            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update notifications");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            if (!notificationRepository.existsById(id)) {
                throw new IllegalArgumentException("Notification not found");
            }

            notificationRepository.deleteById(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification deleted");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Notification not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete notification");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllNotifications() {
        try {
            Long userId = 1L; // Replace with actual user ID

            notificationRepository.findByUserId(userId)
                    .forEach(notification -> notificationRepository.delete(notification));

            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications deleted");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete notifications");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
