package com.assetflow.api.module.audit.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.asset.entity.Asset;
import com.assetflow.api.module.asset.repository.AssetRepository;
import com.assetflow.api.module.audit.dto.*;
import com.assetflow.api.module.audit.entity.*;
import com.assetflow.api.module.audit.repository.AuditAssignmentRepository;
import com.assetflow.api.module.audit.repository.AuditCycleRepository;
import com.assetflow.api.module.audit.repository.AuditItemRepository;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.department.repository.DepartmentRepository;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditCycleRepository auditCycleRepository;
    private final AuditAssignmentRepository auditAssignmentRepository;
    private final AuditItemRepository auditItemRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeProfileRepository employeeProfileRepository;

    @Transactional(readOnly = true)
    public PageResponse<AuditResponse> getAllCycles(AuditCycleStatus status, int page, int size) {
        var pageRequest = PageRequest.of(page, size, Sort.by("startDate").descending());
        var paged = status != null 
                ? auditCycleRepository.findByStatus(status, pageRequest)
                : auditCycleRepository.findAll(pageRequest);
        return PageResponse.of(paged.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public AuditResponse getCycleById(Long id) {
        return toResponse(auditCycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit cycle", id)));
    }

    @Transactional
    public AuditResponse createCycle(AuditCreateRequest request, Long userId) {
        var creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        AuditCycle cycle = AuditCycle.builder()
                .name(request.getName())
                .description(request.getDescription())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(creator)
                .build();

        return toResponse(auditCycleRepository.save(cycle));
    }

    @Transactional
    public AuditResponse closeCycle(Long id, Long userId) {
        AuditCycle cycle = auditCycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit cycle", id));

        if (cycle.getStatus() == AuditCycleStatus.COMPLETED) {
            throw new BusinessException("Audit cycle is already completed");
        }

        var closer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        cycle.setStatus(AuditCycleStatus.COMPLETED);
        cycle.setClosedBy(closer);
        cycle.setClosedAt(Instant.now());

        return toResponse(auditCycleRepository.save(cycle));
    }

    @Transactional
    public AuditAssignmentResponse createAssignment(Long cycleId, AuditAssignmentRequest request) {
        AuditCycle cycle = auditCycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit cycle", cycleId));

        var auditor = userRepository.findById(request.getAuditorUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Auditor user", request.getAuditorUserId()));

        var dept = request.getDepartmentId() != null
                ? departmentRepository.findById(request.getDepartmentId()).orElse(null)
                : null;

        AuditAssignment assignment = AuditAssignment.builder()
                .auditCycle(cycle)
                .auditor(auditor)
                .department(dept)
                .location(request.getLocation())
                .notes(request.getNotes())
                .build();

        assignment = auditAssignmentRepository.save(assignment);

        // Populate items automatically: find all assets belonging to this department (or general if dept is null)
        List<Asset> assets;
        if (dept != null) {
            assets = assetRepository.findAll().stream()
                    .filter(a -> a.getDepartment() != null && a.getDepartment().getId().equals(dept.getId()) && !a.isDeleted())
                    .collect(Collectors.toList());
        } else {
            assets = assetRepository.findAll().stream()
                    .filter(a -> !a.isDeleted())
                    .collect(Collectors.toList());
        }

        for (Asset asset : assets) {
            AuditItem item = AuditItem.builder()
                    .assignment(assignment)
                    .asset(asset)
                    .status(AuditItemStatus.PENDING)
                    .build();
            auditItemRepository.save(item);
        }

        cycle.setStatus(AuditCycleStatus.IN_PROGRESS);
        auditCycleRepository.save(cycle);

        return toAssignmentResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<AuditAssignmentResponse> getAssignments(Long cycleId) {
        return auditAssignmentRepository.findByAuditCycleId(cycleId)
                .stream().map(this::toAssignmentResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditItemResponse> getAssignmentItems(Long assignmentId) {
        return auditItemRepository.findByAssignmentId(assignmentId)
                .stream().map(this::toItemResponse).collect(Collectors.toList());
    }

    @Transactional
    public AuditItemResponse verifyItem(Long itemId, AuditItemVerifyRequest request, Long userId) {
        AuditItem item = auditItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit item", itemId));

        var verifier = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        item.setStatus(request.getStatus());
        if (request.getCondition() != null) {
            item.setCondition(request.getCondition());
            // Update physical asset condition as well
            Asset asset = item.getAsset();
            asset.setCondition(request.getCondition());
            assetRepository.save(asset);
        }
        item.setNotes(request.getNotes());
        item.setVerifiedBy(verifier);
        item.setVerifiedAt(Instant.now());

        return toItemResponse(auditItemRepository.save(item));
    }

    private AuditResponse toResponse(AuditCycle c) {
        var createEp = employeeProfileRepository.findByUserIdAndDeletedFalse(c.getCreatedBy().getId()).orElse(null);
        var closeEp = c.getClosedBy() != null
                ? employeeProfileRepository.findByUserIdAndDeletedFalse(c.getClosedBy().getId()).orElse(null)
                : null;

        return AuditResponse.builder()
                .id(c.getId())
                .uuid(c.getUuid())
                .name(c.getName())
                .description(c.getDescription())
                .status(c.getStatus())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .createdByUserId(c.getCreatedBy().getId())
                .createdByName(createEp != null ? createEp.getFullName() : c.getCreatedBy().getEmail())
                .closedByUserId(c.getClosedBy() != null ? c.getClosedBy().getId() : null)
                .closedByName(closeEp != null ? closeEp.getFullName() : (c.getClosedBy() != null ? c.getClosedBy().getEmail() : null))
                .closedAt(c.getClosedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private AuditAssignmentResponse toAssignmentResponse(AuditAssignment a) {
        var audEp = employeeProfileRepository.findByUserIdAndDeletedFalse(a.getAuditor().getId()).orElse(null);
        return AuditAssignmentResponse.builder()
                .id(a.getId())
                .uuid(a.getUuid())
                .auditCycleId(a.getAuditCycle().getId())
                .auditCycleName(a.getAuditCycle().getName())
                .auditorUserId(a.getAuditor().getId())
                .auditorName(audEp != null ? audEp.getFullName() : a.getAuditor().getEmail())
                .departmentId(a.getDepartment() != null ? a.getDepartment().getId() : null)
                .departmentName(a.getDepartment() != null ? a.getDepartment().getName() : null)
                .location(a.getLocation())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private AuditItemResponse toItemResponse(AuditItem i) {
        var verEp = i.getVerifiedBy() != null
                ? employeeProfileRepository.findByUserIdAndDeletedFalse(i.getVerifiedBy().getId()).orElse(null)
                : null;

        return AuditItemResponse.builder()
                .id(i.getId())
                .assignmentId(i.getAssignment().getId())
                .assetId(i.getAsset().getId())
                .assetName(i.getAsset().getName())
                .assetTag(i.getAsset().getAssetTag())
                .assetSerialNumber(i.getAsset().getSerialNumber())
                .status(i.getStatus())
                .condition(i.getCondition())
                .notes(i.getNotes())
                .verifiedByUserId(i.getVerifiedBy() != null ? i.getVerifiedBy().getId() : null)
                .verifiedByName(verEp != null ? verEp.getFullName() : (i.getVerifiedBy() != null ? i.getVerifiedBy().getEmail() : null))
                .verifiedAt(i.getVerifiedAt())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
