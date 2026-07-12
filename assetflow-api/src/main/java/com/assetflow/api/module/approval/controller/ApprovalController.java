package com.assetflow.api.module.approval.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.module.approval.dto.*;
import com.assetflow.api.module.approval.entity.ApprovalStatus;
import com.assetflow.api.module.approval.service.ApprovalService;
import com.assetflow.api.module.auth.security.UserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/approvals")
@RequiredArgsConstructor
@Tag(name = "Approvals", description = "Enterprise request approvals workflow")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ApprovalResponse>>> getAll(
            @RequestParam(required = false) ApprovalStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(approvalService.getAll(status, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApprovalResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(approvalService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApprovalResponse>> create(
            @Valid @RequestBody ApprovalCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Approval request submitted", approvalService.create(request, principal.getId())));
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ApprovalResponse>> decision(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalDecisionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Decision recorded", approvalService.makeDecision(id, request, principal.getId())));
    }
}
