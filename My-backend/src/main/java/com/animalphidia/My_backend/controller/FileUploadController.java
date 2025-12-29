package com.animalphidia.My_backend.controller;

import com.animalphidia.My_backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.storeFile(file);
            String fileUrl = fileStorageService.getFileUrl(fileName);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("fileName", fileName);
            response.put("fileUrl", fileUrl);
            response.put("fileSize", file.getSize());
            response.put("contentType", file.getContentType());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to upload file");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/files/{fileName}")
    public ResponseEntity<byte[]> getFile(@PathVariable String fileName) {
        try {
            byte[] fileContent = fileStorageService.loadFile(fileName);
            String contentType = getContentType(fileName);

            return ResponseEntity.ok()
                    .header("Content-Type", contentType)
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/files/{fileName}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        try {
            boolean deleted = fileStorageService.deleteFile(fileName);

            if (deleted) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "File deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete file");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private String getContentType(String fileName) {
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".gif")) {
            return "image/gif";
        } else if (fileName.endsWith(".pdf")) {
            return "application/pdf";
        } else {
            return "application/octet-stream";
        }
    }
}