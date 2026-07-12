package com.assetflow.api.module.allocation.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.module.allocation.dto.*;
import com.assetflow.api.module.allocation.entity.AllocationStatus;
import com.assetflow.api.module.allocation.service.AllocationService;
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

@RestController
@RequestMapping("/api/v1/allocations")
@RequiredArgsConstructor
@Tag(name = "Allocations", description = "Asset allocation, return, and transfer")
public class AllocationController {

    private final AllocationService allocationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AllocationResponse>>> getAllAllocations(
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) AllocationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                allocationService.getAllAllocations(assetId, userId, status, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AllocationResponse>> getAllocation(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(allocationService.getAllocationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Allocate an asset to an employee")
    public ResponseEntity<ApiResponse<AllocationResponse>> allocate(
            @Valid @RequestBody AllocateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset allocated", allocationService.allocateAsset(request, principal.getId())));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Return an allocated asset")
    public ResponseEntity<ApiResponse<AllocationResponse>> returnAsset(
            @PathVariable Long id,
            @RequestBody ReturnRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Asset returned", allocationService.returnAsset(id, request, principal.getId())));
    }

    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Transfer an asset to another employee")
    public ResponseEntity<ApiResponse<AllocationResponse>> transfer(
            @PathVariable Long id,
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Asset transferred", allocationService.transferAsset(id, request, principal.getId())));
    }

    @PostMapping("/{id}/photos")
    @Operation(summary = "Upload a condition photo for an allocation")
    public ResponseEntity<ApiResponse<Void>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "BEFORE") String photoType) {
        allocationService.uploadPhoto(id, file, photoType);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Photo uploaded"));
    }
}
