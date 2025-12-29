package com.animalphidia.My_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.file.allowed-extensions:jpg,jpeg,png,gif}")
    private String[] allowedExtensions;

    @Value("${app.file.max-file-size:10485760}") // 10MB
    private long maxFileSize;

    public String storeFile(MultipartFile file) throws IOException {
        // Validate file size
        if (file.getSize() > maxFileSize) {
            throw new IOException("File size exceeds maximum limit of " + maxFileSize + " bytes");
        }

        // Get original filename
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        // Validate file extension
        String fileExtension = getFileExtension(originalFileName);
        if (!isValidExtension(fileExtension)) {
            throw new IOException("File type not allowed. Allowed types: " +
                    String.join(", ", allowedExtensions));
        }

        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + "." + fileExtension;

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Copy file to target location
        Path targetLocation = uploadPath.resolve(fileName);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        }

        return fileName;
    }

    public byte[] loadFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + fileName);
        }
        return Files.readAllBytes(filePath);
    }

    public boolean deleteFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
        return Files.deleteIfExists(filePath);
    }

    public String getFileUrl(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return null;
        }
        return "/uploads/" + fileName;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isValidExtension(String extension) {
        if (extension == null || extension.isEmpty()) {
            return false;
        }
        for (String allowedExt : allowedExtensions) {
            if (allowedExt.equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }
}