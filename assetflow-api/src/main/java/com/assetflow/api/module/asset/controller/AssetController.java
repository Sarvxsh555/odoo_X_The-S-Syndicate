package com.assetflow.api.module.asset.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.module.asset.dto.AssetRequest;
import com.assetflow.api.module.asset.dto.AssetResponse;
import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.asset.entity.AssetStatus;
import com.assetflow.api.module.asset.service.AssetService;
import com.assetflow.api.module.auth.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.Instant;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@Tag(name = "Assets", description = "Asset management, images, documents, and QR codes")
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    @Operation(summary = "List assets with filtering, search, and pagination")
    public ResponseEntity<ApiResponse<PageResponse<AssetResponse>>> getAllAssets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) AssetStatus status,
            @RequestParam(required = false) AssetCondition condition,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                assetService.getAllAssets(search, categoryId, status, condition, departmentId, sortBy, sortDir, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full asset details")
    public ResponseEntity<ApiResponse<AssetResponse>> getAsset(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assetService.getAssetById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register a new asset (Admin only)")
    public ResponseEntity<ApiResponse<AssetResponse>> createAsset(
            @Valid @RequestBody AssetRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset registered", assetService.createAsset(request, principal.getId())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update asset details (Admin only)")
    public ResponseEntity<ApiResponse<AssetResponse>> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Asset updated", assetService.updateAsset(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete an asset (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.ok(ApiResponse.success("Asset deleted"));
    }

    // Images
    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload an image for an asset")
    public ResponseEntity<ApiResponse<AssetResponse.ImageInfo>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded", assetService.addImage(id, file, isPrimary)));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an asset image")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id, @PathVariable Long imageId) {
        assetService.deleteImage(id, imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted"));
    }

    // Documents
    @PostMapping("/{id}/documents")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload a document for an asset")
    public ResponseEntity<ApiResponse<AssetResponse.DocumentInfo>> uploadDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String docType) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded", assetService.addDocument(id, file, name, docType)));
    }

    @DeleteMapping("/{id}/documents/{documentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an asset document")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id, @PathVariable Long documentId) {
        assetService.deleteDocument(id, documentId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted"));
    }

    // QR Code
    @GetMapping("/{id}/qr")
    @Operation(summary = "Get or generate QR code for an asset")
    public ResponseEntity<ApiResponse<AssetResponse.QrInfo>> getQrCode(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assetService.getOrGenerateQr(id)));
    }

    @PostMapping("/{id}/qr/regenerate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Regenerate QR code for an asset (Admin only)")
    public ResponseEntity<ApiResponse<AssetResponse.QrInfo>> regenerateQrCode(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("QR code regenerated", assetService.regenerateQr(id)));
    }

    // GPS Location update
    @PatchMapping("/{id}/location")
    @Operation(summary = "Update GPS location of an asset (vehicle tracking simulation)")
    public ResponseEntity<ApiResponse<Void>> updateGpsLocation(
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal latitude,
            @RequestParam(required = false) BigDecimal longitude,
            @RequestParam(required = false) String location) {
        assetService.updateLocation(id, latitude, longitude, location);
        return ResponseEntity.ok(ApiResponse.success("Location updated"));
    }

    // NFC Tag assignment
    @PatchMapping("/{id}/nfc")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign or update NFC tag ID for an asset")
    public ResponseEntity<ApiResponse<Void>> updateNfcTag(
            @PathVariable Long id,
            @RequestParam String nfcTagId) {
        assetService.updateNfcTag(id, nfcTagId);
        return ResponseEntity.ok(ApiResponse.success("NFC tag updated"));
    }

    // Map view - all assets with coordinates
    @GetMapping("/map")
    @Operation(summary = "Get all assets that have GPS coordinates for map display")
    public ResponseEntity<ApiResponse<?>> getMapAssets() {
        return ResponseEntity.ok(ApiResponse.success(assetService.getAssetsWithLocation()));
    }
}
