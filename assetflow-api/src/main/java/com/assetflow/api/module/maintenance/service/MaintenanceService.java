package com.assetflow.api.module.maintenance.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.asset.entity.Asset;
import com.assetflow.api.module.asset.entity.AssetStatus;
import com.assetflow.api.module.asset.repository.AssetRepository;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.maintenance.dto.*;
import com.assetflow.api.module.maintenance.entity.*;
import com.assetflow.api.module.maintenance.repository.MaintenanceRepository;
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
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<MaintenanceResponse> getAllRequests(Long assetId, MaintenanceStatus status, MaintenancePriority priority, int page, int size) {
        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PageResponse.of(maintenanceRepository.findAllWithFilters(assetId, status, priority, pageRequest)
                .map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public MaintenanceResponse getById(Long id) {
        return toResponse(maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request", id)));
    }

    @Transactional
    public MaintenanceResponse create(MaintenanceCreateRequest request, Long requestedByUserId) {
        Asset asset = assetRepository.findByIdAndDeletedFalse(request.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset", request.getAssetId()));
        var requestedBy = userRepository.findById(requestedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", requestedByUserId));

        MaintenanceRequest maintenance = MaintenanceRequest.builder()
                .asset(asset)
                .requestedBy(requestedBy)
                .priority(request.getPriority())
                .title(request.getTitle())
                .description(request.getDescription())
                .scheduledDate(request.getScheduledDate())
                .estimatedCost(request.getEstimatedCost())
                .status(com.assetflow.api.module.auth.entity.UserRole.ROLE_ADMIN.equals(requestedBy.getRole()) ? MaintenanceStatus.APPROVED : MaintenanceStatus.PENDING)
                .approvedBy(com.assetflow.api.module.auth.entity.UserRole.ROLE_ADMIN.equals(requestedBy.getRole()) ? requestedBy : null)
                .build();

        maintenance = maintenanceRepository.save(maintenance);

        // Notify admins
        notificationService.createNotification(
                requestedByUserId,
                "Maintenance Request Submitted",
                "Your maintenance request for '" + asset.getName() + "' has been submitted.",
                "MAINTENANCE_REQUESTED", "maintenance", maintenance.getId()
        );

        return toResponse(maintenance);
    }

    @Transactional
    public MaintenanceResponse updateStatus(Long id, MaintenanceStatusRequest request, Long updatedByUserId) {
        MaintenanceRequest maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request", id));

        MaintenanceStatus oldStatus = maintenance.getStatus();
        maintenance.setStatus(request.getStatus());

        if (request.getStatus() == MaintenanceStatus.APPROVED) {
            maintenance.setApprovedBy(userRepository.findById(updatedByUserId).orElse(null));
        }

        if (request.getStatus() == MaintenanceStatus.RESOLVED) {
            maintenance.setCompletedDate(Instant.now());
            maintenance.setResolutionNotes(request.getResolutionNotes());
            maintenance.setActualCost(request.getActualCost());

            // Update asset status back to AVAILABLE
            Asset asset = maintenance.getAsset();
            if (asset.getStatus() == AssetStatus.MAINTENANCE) {
                asset.setStatus(AssetStatus.AVAILABLE);
                assetRepository.save(asset);
            }

            notificationService.createNotification(
                    maintenance.getRequestedBy().getId(),
                    "Maintenance Resolved",
                    "Maintenance for '" + asset.getName() + "' has been resolved.",
                    "MAINTENANCE_RESOLVED", "maintenance", id
            );
        }

        if (request.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            Asset asset = maintenance.getAsset();
            asset.setStatus(AssetStatus.MAINTENANCE);
            assetRepository.save(asset);
        }

        return toResponse(maintenanceRepository.save(maintenance));
    }

    @Transactional
    public MaintenanceResponse assign(Long id, Long technicianId) {
        MaintenanceRequest maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request", id));
        var technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("User", technicianId));
        maintenance.setAssignedTechnician(technician);
        maintenance.setStatus(MaintenanceStatus.ASSIGNED);
        return toResponse(maintenanceRepository.save(maintenance));
    }

    private MaintenanceResponse toResponse(MaintenanceRequest m) {
        var byEp = employeeProfileRepository.findByUserIdAndDeletedFalse(m.getRequestedBy().getId()).orElse(null);
        return MaintenanceResponse.builder()
                .id(m.getId())
                .assetId(m.getAsset().getId())
                .assetTag(m.getAsset().getAssetTag())
                .assetName(m.getAsset().getName())
                .requestedByUserId(m.getRequestedBy().getId())
                .requestedByName(byEp != null ? byEp.getFullName() : m.getRequestedBy().getEmail())
                .assignedTechnicianId(m.getAssignedTechnician() != null ? m.getAssignedTechnician().getId() : null)
                .priority(m.getPriority())
                .status(m.getStatus())
                .title(m.getTitle())
                .description(m.getDescription())
                .resolutionNotes(m.getResolutionNotes())
                .scheduledDate(m.getScheduledDate())
                .completedDate(m.getCompletedDate())
                .estimatedCost(m.getEstimatedCost())
                .actualCost(m.getActualCost())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
