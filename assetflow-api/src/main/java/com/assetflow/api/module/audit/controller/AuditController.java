package com.assetflow.api.module.audit.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.module.audit.dto.*;
import com.assetflow.api.module.audit.entity.AuditCycleStatus;
import com.assetflow.api.module.audit.service.AuditService;
import com.assetflow.api.module.auth.security.UserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Audits", description = "Asset audit cycles and verifications")
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/audits")
    public ResponseEntity<ApiResponse<PageResponse<AuditResponse>>> getAllCycles(
            @RequestParam(required = false) AuditCycleStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAllCycles(status, page, size)));
    }

    @GetMapping("/audits/{id}")
    public ResponseEntity<ApiResponse<AuditResponse>> getCycle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getCycleById(id)));
    }

    @PostMapping("/audits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditResponse>> createCycle(
            @Valid @RequestBody AuditCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Audit cycle created", auditService.createCycle(request, principal.getId())));
    }

    @PutMapping("/audits/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditResponse>> closeCycle(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Audit cycle completed", auditService.closeCycle(id, principal.getId())));
    }

    @PostMapping("/audits/{id}/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditAssignmentResponse>> createAssignment(
            @PathVariable Long id,
            @Valid @RequestBody AuditAssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Audit assignment created", auditService.createAssignment(id, request)));
    }

    @GetMapping("/audits/{id}/assignments")
    public ResponseEntity<ApiResponse<List<AuditAssignmentResponse>>> getAssignments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAssignments(id)));
    }

    @GetMapping("/audit-assignments/{id}/items")
    public ResponseEntity<ApiResponse<List<AuditItemResponse>>> getAssignmentItems(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAssignmentItems(id)));
    }

    @PostMapping("/audit-items/{id}/verify")
    public ResponseEntity<ApiResponse<AuditItemResponse>> verifyItem(
            @PathVariable Long id,
            @Valid @RequestBody AuditItemVerifyRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Item verified", auditService.verifyItem(id, request, principal.getId())));
    }
}
