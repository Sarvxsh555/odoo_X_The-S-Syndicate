package com.assetflow.api.module.allocation.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.allocation.dto.*;
import com.assetflow.api.module.allocation.entity.*;
import com.assetflow.api.module.allocation.repository.*;
import com.assetflow.api.module.asset.entity.*;
import com.assetflow.api.module.asset.repository.AssetRepository;
import com.assetflow.api.module.asset.service.StorageService;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.department.repository.DepartmentRepository;
import com.assetflow.api.module.notification.service.NotificationService;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<AllocationResponse> getAllAllocations(Long assetId, Long userId, AllocationStatus status, int page, int size) {
        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var allocations = allocationRepository.findAllWithFilters(assetId, userId, status, pageRequest);
        return PageResponse.of(allocations.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public AllocationResponse getAllocationById(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation", id));
        return toResponse(allocation);
    }

    @Transactional
    public AllocationResponse allocateAsset(AllocateRequest request, Long allocatedByUserId) {
        Asset asset = assetRepository.findByIdAndDeletedFalse(request.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset", request.getAssetId()));

        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new BusinessException("Asset '" + asset.getName() + "' is not available for allocation. Current status: " + asset.getStatus());
        }

        if (allocationRepository.existsByAssetIdAndStatus(request.getAssetId(), AllocationStatus.ACTIVE)) {
            throw new BusinessException("Asset is already allocated to someone. Return it first.");
        }

        User allocatedTo = userRepository.findById(request.getAllocatedToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", request.getAllocatedToUserId()));
        User allocatedBy = userRepository.findById(allocatedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", allocatedByUserId));

        Allocation allocation = Allocation.builder()
                .asset(asset)
                .allocatedTo(allocatedTo)
                .allocatedBy(allocatedBy)
                .status(AllocationStatus.ACTIVE)
                .expectedReturnDate(request.getExpectedReturnDate())
                .conditionAtAllocation(request.getConditionAtAllocation())
                .notes(request.getNotes())
                .build();

        if (request.getDepartmentId() != null) {
            departmentRepository.findByIdAndDeletedFalse(request.getDepartmentId())
                    .ifPresent(allocation::setDepartment);
        }

        allocation = allocationRepository.save(allocation);

        // Update asset status
        asset.setStatus(AssetStatus.ALLOCATED);
        assetRepository.save(asset);

        // Send notification to employee
        notificationService.createNotification(
                allocatedTo.getId(),
                "Asset Allocated to You",
                "Asset '" + asset.getName() + "' (Tag: " + asset.getAssetTag() + ") has been allocated to you.",
                "ASSET_ALLOCATED", "allocation", allocation.getId()
        );

        return toResponse(allocation);
    }

    @Transactional
    public AllocationResponse returnAsset(Long allocationId, ReturnRequest request, Long returnedByUserId) {
        Allocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation", allocationId));

        if (allocation.getStatus() != AllocationStatus.ACTIVE) {
            throw new BusinessException("This allocation is not active. Status: " + allocation.getStatus());
        }

        User returnedBy = userRepository.findById(returnedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", returnedByUserId));

        allocation.setStatus(AllocationStatus.RETURNED);
        allocation.setActualReturnDate(Instant.now());
        allocation.setConditionAtReturn(request.getConditionAtReturn());
        allocation.setReturnNotes(request.getNotes());
        allocation.setReturnedTo(returnedBy);
        allocationRepository.save(allocation);

        // Update asset status
        Asset asset = allocation.getAsset();
        asset.setStatus(AssetStatus.AVAILABLE);
        asset.setCondition(request.getConditionAtReturn() != null ? request.getConditionAtReturn() : asset.getCondition());
        assetRepository.save(asset);

        notificationService.createNotification(
                allocation.getAllocatedTo().getId(),
                "Asset Returned",
                "Asset '" + asset.getName() + "' has been successfully returned.",
                "ASSET_RETURNED", "allocation", allocationId
        );

        return toResponse(allocation);
    }

    @Transactional
    public AllocationResponse transferAsset(Long allocationId, TransferRequest request, Long transferredByUserId) {
        Allocation currentAllocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation", allocationId));

        if (currentAllocation.getStatus() != AllocationStatus.ACTIVE) {
            throw new BusinessException("Cannot transfer: allocation is not active");
        }

        User transferredBy = userRepository.findById(transferredByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", transferredByUserId));
        User newHolder = userRepository.findById(request.getNewHolderUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", request.getNewHolderUserId()));

        // Close current allocation
        currentAllocation.setStatus(AllocationStatus.TRANSFERRED);
        currentAllocation.setActualReturnDate(Instant.now());
        currentAllocation.setReturnNotes("Transferred to: " + newHolder.getEmail());
        allocationRepository.save(currentAllocation);

        // Create new allocation
        Allocation newAllocation = Allocation.builder()
                .asset(currentAllocation.getAsset())
                .allocatedTo(newHolder)
                .allocatedBy(transferredBy)
                .status(AllocationStatus.ACTIVE)
                .expectedReturnDate(request.getExpectedReturnDate())
                .conditionAtAllocation(currentAllocation.getAsset().getCondition())
                .notes("Transferred from previous holder")
                .build();
        newAllocation = allocationRepository.save(newAllocation);

        notificationService.createNotification(
                newHolder.getId(),
                "Asset Transferred to You",
                "Asset '" + currentAllocation.getAsset().getName() + "' has been transferred to you.",
                "ASSET_ALLOCATED", "allocation", newAllocation.getId()
        );

        return toResponse(newAllocation);
    }

    @Transactional
    public void uploadPhoto(Long allocationId, MultipartFile file, String photoType) {
        Allocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation", allocationId));
        String url = storageService.store(file, "allocations");
        AllocationPhoto photo = AllocationPhoto.builder()
                .allocation(allocation)
                .url(url)
                .photoType(photoType.toUpperCase())
                .build();
        allocation.getPhotos().add(photo);
        allocationRepository.save(allocation);
    }

    private AllocationResponse toResponse(Allocation a) {
        var ep = employeeProfileRepository.findByUserIdAndDeletedFalse(a.getAllocatedTo().getId()).orElse(null);
        var byEp = employeeProfileRepository.findByUserIdAndDeletedFalse(a.getAllocatedBy().getId()).orElse(null);
        return AllocationResponse.builder()
                .id(a.getId())
                .assetId(a.getAsset().getId())
                .assetTag(a.getAsset().getAssetTag())
                .assetName(a.getAsset().getName())
                .allocatedToUserId(a.getAllocatedTo().getId())
                .allocatedToName(ep != null ? ep.getFullName() : a.getAllocatedTo().getEmail())
                .allocatedByUserId(a.getAllocatedBy().getId())
                .allocatedByName(byEp != null ? byEp.getFullName() : a.getAllocatedBy().getEmail())
                .departmentId(a.getDepartment() != null ? a.getDepartment().getId() : null)
                .departmentName(a.getDepartment() != null ? a.getDepartment().getName() : null)
                .status(a.getStatus())
                .allocationDate(a.getAllocationDate())
                .expectedReturnDate(a.getExpectedReturnDate())
                .actualReturnDate(a.getActualReturnDate())
                .conditionAtAllocation(a.getConditionAtAllocation())
                .conditionAtReturn(a.getConditionAtReturn())
                .notes(a.getNotes())
                .returnNotes(a.getReturnNotes())
                .photos(a.getPhotos().stream().map(p -> AllocationResponse.PhotoInfo.builder()
                        .id(p.getId()).url(p.getUrl()).photoType(p.getPhotoType()).build())
                        .collect(Collectors.toList()))
                .createdAt(a.getCreatedAt())
                .build();
    }
}
