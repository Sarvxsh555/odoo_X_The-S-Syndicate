package com.assetflow.api.module.approval.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.approval.dto.*;
import com.assetflow.api.module.approval.entity.*;
import com.assetflow.api.module.approval.repository.ApprovalRequestRepository;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.notification.service.NotificationService;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRequestRepository approvalRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<ApprovalResponse> getAll(ApprovalStatus status, int page, int size) {
        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PageResponse.of(approvalRepository.findAllWithFilters(status, pageRequest).map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public ApprovalResponse getById(Long id) {
        return toResponse(approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval request", id)));
    }

    @Transactional
    public ApprovalResponse create(ApprovalCreateRequest request, Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        ApprovalRequest approval = ApprovalRequest.builder()
                .type(request.getType())
                .entityId(request.getEntityId())
                .entityType(request.getEntityType())
                .requestedBy(user)
                .status(ApprovalStatus.PENDING)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        approval = approvalRepository.save(approval);

        // Notify admins or supervisors
        notificationService.createNotification(
                userId,
                "Approval Request Submitted",
                "Your approval request for '" + request.getTitle() + "' has been submitted.",
                "APPROVAL_REQUIRED", "approval", approval.getId()
        );

        return toResponse(approval);
    }

    @Transactional
    public ApprovalResponse makeDecision(Long id, ApprovalDecisionRequest request, Long deciderUserId) {
        ApprovalRequest approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval request", id));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new BusinessException("Approval request is already resolved");
        }

        var decider = userRepository.findById(deciderUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", deciderUserId));

        approval.setStatus(request.getStatus());
        approval.setApprovedBy(decider);
        approval.setResolutionNotes(request.getResolutionNotes());
        approval.setResolvedAt(Instant.now());

        approval = approvalRepository.save(approval);

        // Notify creator
        notificationService.createNotification(
                approval.getRequestedBy().getId(),
                "Approval Decision",
                "Your request for '" + approval.getTitle() + "' was " + request.getStatus().name().toLowerCase() + ".",
                "APPROVAL_RESOLVED", "approval", id
        );

        return toResponse(approval);
    }

    private ApprovalResponse toResponse(ApprovalRequest a) {
        var epReq = employeeProfileRepository.findByUserIdAndDeletedFalse(a.getRequestedBy().getId()).orElse(null);
        var epApp = a.getApprovedBy() != null
                ? employeeProfileRepository.findByUserIdAndDeletedFalse(a.getApprovedBy().getId()).orElse(null)
                : null;

        return ApprovalResponse.builder()
                .id(a.getId())
                .uuid(a.getUuid())
                .type(a.getType())
                .entityId(a.getEntityId())
                .entityType(a.getEntityType())
                .requestedByUserId(a.getRequestedBy().getId())
                .requestedByName(epReq != null ? epReq.getFullName() : a.getRequestedBy().getEmail())
                .approvedByUserId(a.getApprovedBy() != null ? a.getApprovedBy().getId() : null)
                .approvedByName(epApp != null ? epApp.getFullName() : (a.getApprovedBy() != null ? a.getApprovedBy().getEmail() : null))
                .status(a.getStatus())
                .title(a.getTitle())
                .description(a.getDescription())
                .notes(a.getNotes())
                .resolutionNotes(a.getResolutionNotes())
                .createdAt(a.getCreatedAt())
                .resolvedAt(a.getResolvedAt())
                .build();
    }
}
