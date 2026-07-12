package com.assetflow.api.module.maintenance.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.module.auth.security.UserPrincipal;
import com.assetflow.api.module.maintenance.dto.*;
import com.assetflow.api.module.maintenance.entity.*;
import com.assetflow.api.module.maintenance.service.MaintenanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
@Tag(name = "Maintenance", description = "Asset maintenance request workflow")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MaintenanceResponse>>> getAll(
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) MaintenancePriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                maintenanceService.getAllRequests(assetId, status, priority, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(maintenanceService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceResponse>> create(
            @Valid @RequestBody MaintenanceCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Maintenance request submitted", maintenanceService.create(request, principal.getId())));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", maintenanceService.updateStatus(id, request, principal.getId())));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> assign(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        return ResponseEntity.ok(ApiResponse.success("Technician assigned", maintenanceService.assign(id, technicianId)));
    }
}
