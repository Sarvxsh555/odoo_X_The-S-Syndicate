package com.assetflow.api.module.allocation.service;

import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.allocation.dto.AllocateRequest;
import com.assetflow.api.module.allocation.dto.ReturnRequest;
import com.assetflow.api.module.allocation.dto.TransferRequest;
import com.assetflow.api.module.allocation.entity.Allocation;
import com.assetflow.api.module.allocation.entity.AllocationStatus;
import com.assetflow.api.module.allocation.repository.AllocationRepository;
import com.assetflow.api.module.asset.entity.Asset;
import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.asset.entity.AssetStatus;
import com.assetflow.api.module.asset.repository.AssetRepository;
import com.assetflow.api.module.asset.service.StorageService;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.department.repository.DepartmentRepository;
import com.assetflow.api.module.notification.service.NotificationService;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AllocationServiceTest {

    @Mock private AllocationRepository allocationRepository;
    @Mock private AssetRepository assetRepository;
    @Mock private UserRepository userRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private EmployeeProfileRepository employeeProfileRepository;
    @Mock private StorageService storageService;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private AllocationService allocationService;

    private Asset asset;
    private User employee;
    private User admin;

    @BeforeEach
    void setUp() {
        asset = Asset.builder()
                .id(1L)
                .assetTag("AST-001")
                .name("MacBook Pro")
                .status(AssetStatus.AVAILABLE)
                .condition(AssetCondition.GOOD)
                .build();

        employee = User.builder().id(10L).email("employee@assetflow.com").build();
        admin = User.builder().id(1L).email("admin@assetflow.com").build();

        lenient().when(employeeProfileRepository.findByUserIdAndDeletedFalse(any())).thenReturn(Optional.empty());
        lenient().when(allocationRepository.save(any(Allocation.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void allocateAsset_success_marksAssetAllocatedAndNotifiesEmployee() {
        AllocateRequest request = new AllocateRequest();
        request.setAssetId(1L);
        request.setAllocatedToUserId(10L);
        request.setConditionAtAllocation(AssetCondition.GOOD);

        when(assetRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(asset));
        when(allocationRepository.existsByAssetIdAndStatus(1L, AllocationStatus.ACTIVE)).thenReturn(false);
        when(userRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        var response = allocationService.allocateAsset(request, 1L);

        assertThat(response.getStatus()).isEqualTo(AllocationStatus.ACTIVE);
        assertThat(asset.getStatus()).isEqualTo(AssetStatus.ALLOCATED);
        verify(assetRepository).save(asset);
        verify(notificationService).createNotification(eq(10L), anyString(), anyString(), eq("ASSET_ALLOCATED"), eq("allocation"), any());
    }

    @Test
    void allocateAsset_throwsWhenAssetNotAvailable() {
        asset.setStatus(AssetStatus.MAINTENANCE);
        AllocateRequest request = new AllocateRequest();
        request.setAssetId(1L);
        request.setAllocatedToUserId(10L);

        when(assetRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(asset));

        assertThatThrownBy(() -> allocationService.allocateAsset(request, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not available");

        verifyNoInteractions(notificationService);
    }

    @Test
    void allocateAsset_throwsWhenAssetAlreadyActivelyAllocated() {
        AllocateRequest request = new AllocateRequest();
        request.setAssetId(1L);
        request.setAllocatedToUserId(10L);

        when(assetRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(asset));
        when(allocationRepository.existsByAssetIdAndStatus(1L, AllocationStatus.ACTIVE)).thenReturn(true);

        assertThatThrownBy(() -> allocationService.allocateAsset(request, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already allocated");
    }

    @Test
    void allocateAsset_throwsWhenAssetNotFound() {
        AllocateRequest request = new AllocateRequest();
        request.setAssetId(999L);
        request.setAllocatedToUserId(10L);

        when(assetRepository.findByIdAndDeletedFalse(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> allocationService.allocateAsset(request, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void returnAsset_success_freesAssetAndUpdatesCondition() {
        Allocation allocation = Allocation.builder()
                .id(5L)
                .asset(asset)
                .allocatedTo(employee)
                .allocatedBy(admin)
                .status(AllocationStatus.ACTIVE)
                .build();
        asset.setStatus(AssetStatus.ALLOCATED);

        ReturnRequest request = new ReturnRequest();
        request.setConditionAtReturn(AssetCondition.FAIR);

        when(allocationRepository.findById(5L)).thenReturn(Optional.of(allocation));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        var response = allocationService.returnAsset(5L, request, 1L);

        assertThat(response.getStatus()).isEqualTo(AllocationStatus.RETURNED);
        assertThat(asset.getStatus()).isEqualTo(AssetStatus.AVAILABLE);
        assertThat(asset.getCondition()).isEqualTo(AssetCondition.FAIR);
        verify(notificationService).createNotification(eq(10L), anyString(), anyString(), eq("ASSET_RETURNED"), eq("allocation"), eq(5L));
    }

    @Test
    void returnAsset_throwsWhenAllocationNotActive() {
        Allocation allocation = Allocation.builder()
                .id(5L)
                .asset(asset)
                .allocatedTo(employee)
                .allocatedBy(admin)
                .status(AllocationStatus.RETURNED)
                .build();

        when(allocationRepository.findById(5L)).thenReturn(Optional.of(allocation));

        assertThatThrownBy(() -> allocationService.returnAsset(5L, new ReturnRequest(), 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not active");
    }

    @Test
    void transferAsset_success_closesOldAllocationAndOpensNew() {
        Allocation currentAllocation = Allocation.builder()
                .id(5L)
                .asset(asset)
                .allocatedTo(employee)
                .allocatedBy(admin)
                .status(AllocationStatus.ACTIVE)
                .build();
        User newHolder = User.builder().id(20L).email("newholder@assetflow.com").build();

        TransferRequest request = new TransferRequest();
        request.setNewHolderUserId(20L);

        when(allocationRepository.findById(5L)).thenReturn(Optional.of(currentAllocation));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.findById(20L)).thenReturn(Optional.of(newHolder));

        var response = allocationService.transferAsset(5L, request, 1L);

        assertThat(currentAllocation.getStatus()).isEqualTo(AllocationStatus.TRANSFERRED);
        assertThat(response.getStatus()).isEqualTo(AllocationStatus.ACTIVE);
        assertThat(response.getAllocatedToUserId()).isEqualTo(20L);

        ArgumentCaptor<Allocation> savedCaptor = ArgumentCaptor.forClass(Allocation.class);
        verify(allocationRepository, times(2)).save(savedCaptor.capture());
        assertThat(savedCaptor.getAllValues()).anyMatch(a -> a.getStatus() == AllocationStatus.TRANSFERRED);
        assertThat(savedCaptor.getAllValues()).anyMatch(a -> a.getStatus() == AllocationStatus.ACTIVE && a.getAllocatedTo() == newHolder);

        verify(notificationService).createNotification(eq(20L), anyString(), anyString(), eq("ASSET_ALLOCATED"), eq("allocation"), any());
    }

    @Test
    void transferAsset_throwsWhenAllocationNotActive() {
        Allocation currentAllocation = Allocation.builder()
                .id(5L)
                .asset(asset)
                .allocatedTo(employee)
                .allocatedBy(admin)
                .status(AllocationStatus.RETURNED)
                .build();

        TransferRequest request = new TransferRequest();
        request.setNewHolderUserId(20L);

        when(allocationRepository.findById(5L)).thenReturn(Optional.of(currentAllocation));

        assertThatThrownBy(() -> allocationService.transferAsset(5L, request, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cannot transfer");
    }
}
