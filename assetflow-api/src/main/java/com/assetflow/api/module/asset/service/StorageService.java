package com.assetflow.api.module.asset.service;

import com.assetflow.api.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final StorageProperties storageProperties;
    private Path rootLocation;

    @PostConstruct
    public void init() {
        rootLocation = Paths.get(storageProperties.getUploadDir());
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve("assets/images"));
            Files.createDirectories(rootLocation.resolve("assets/documents"));
            Files.createDirectories(rootLocation.resolve("assets/qr"));
            Files.createDirectories(rootLocation.resolve("employees/avatars"));
            Files.createDirectories(rootLocation.resolve("allocations"));
            log.info("Storage initialized at: {}", rootLocation.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String store(MultipartFile file, String subDir) {
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot store empty file");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";

        String filename = UUID.randomUUID() + extension;
        Path targetLocation = rootLocation.resolve(subDir).resolve(filename);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored file: {}", targetLocation);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }

        return storageProperties.getBaseUrl() + "/uploads/" + subDir + "/" + filename;
    }

    public void delete(String url) {
        if (url == null) return;
        try {
            String relativePath = url.replace(storageProperties.getBaseUrl() + "/uploads/", "");
            Path filePath = rootLocation.resolve(relativePath);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file: {}", url);
        }
    }

    public String storeQrImage(byte[] imageBytes, String filename) {
        Path targetLocation = rootLocation.resolve("assets/qr").resolve(filename);
        try {
            Files.write(targetLocation, imageBytes);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store QR code image", e);
        }
        return storageProperties.getBaseUrl() + "/uploads/assets/qr/" + filename;
    }
}
