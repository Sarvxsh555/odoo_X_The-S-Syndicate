package com.assetflow.api.module.dashboard.service;

import com.assetflow.api.module.allocation.entity.AllocationStatus;
import com.assetflow.api.module.allocation.repository.AllocationRepository;
import com.assetflow.api.module.asset.entity.AssetStatus;
import com.assetflow.api.module.asset.repository.AssetRepository;
import com.assetflow.api.module.booking.repository.BookingRepository;
import com.assetflow.api.module.dashboard.dto.*;
import com.assetflow.api.module.department.repository.DepartmentRepository;
import com.assetflow.api.module.maintenance.entity.MaintenanceStatus;
import com.assetflow.api.module.maintenance.repository.MaintenanceRepository;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AssetRepository assetRepository;
    private final AllocationRepository allocationRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final BookingRepository bookingRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long totalAssets = assetRepository.countByDeletedFalse();
        long availableAssets = assetRepository.countByStatusAndDeletedFalse(AssetStatus.AVAILABLE);
        long allocatedAssets = assetRepository.countByStatusAndDeletedFalse(AssetStatus.ALLOCATED);
        long maintenanceAssets = assetRepository.countByStatusAndDeletedFalse(AssetStatus.MAINTENANCE);
        long totalEmployees = employeeProfileRepository.countByDeletedFalse();
        long pendingMaintenance = maintenanceRepository.countByStatus(MaintenanceStatus.PENDING);
        long activeAllocations = allocationRepository.countByStatus(AllocationStatus.ACTIVE);
        long overdueAllocations = allocationRepository.countByStatus(AllocationStatus.OVERDUE);
        long expiringWarranties = assetRepository.countWarrantyExpiringBetween(
                LocalDate.now(), LocalDate.now().plusDays(30));

        return DashboardStatsResponse.builder()
                .totalAssets(totalAssets)
                .availableAssets(availableAssets)
                .allocatedAssets(allocatedAssets)
                .maintenanceAssets(maintenanceAssets)
                .totalEmployees(totalEmployees)
                .pendingMaintenance(pendingMaintenance)
                .activeAllocations(activeAllocations)
                .overdueAllocations(overdueAllocations)
                .expiringWarranties30Days(expiringWarranties)
                .assetUtilizationRate(totalAssets > 0 ? (double) allocatedAssets / totalAssets * 100 : 0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDepartmentDistribution() {
        return assetRepository.countByDepartment().stream()
                .map(row -> Map.of("department", row[0], "count", row[1]))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAssetStatusBreakdown() {
        return assetRepository.countByStatus().stream()
                .map(row -> Map.of("status", row[0].toString(), "count", row[1]))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMaintenanceTrends() {
        return maintenanceRepository.countByStatus().stream()
                .map(row -> Map.of("status", row[0].toString(), "count", row[1]))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExpiringWarranties() {
        return assetRepository.findWarrantyExpiringBetween(
                LocalDate.now(), LocalDate.now().plusDays(90), PageRequest.of(0, 10))
                .stream()
                .map(a -> Map.of(
                        "id", (Object) a.getId(),
                        "name", a.getName(),
                        "assetTag", a.getAssetTag(),
                        "warrantyExpiry", a.getWarrantyExpiry().toString()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUpcomingReturns() {
        return allocationRepository.findUpcomingReturns(
                LocalDate.now(), LocalDate.now().plusDays(14), PageRequest.of(0, 10))
                .stream()
                .map(a -> Map.of(
                        "id", (Object) a.getId(),
                        "assetName", a.getAsset().getName(),
                        "assetTag", a.getAsset().getAssetTag(),
                        "expectedReturnDate", a.getExpectedReturnDate().toString()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getIdleAssets() {
        return assetRepository.findIdleAssets(PageRequest.of(0, 10))
                .stream()
                .map(a -> Map.of(
                        "id", (Object) a.getId(),
                        "name", a.getName(),
                        "assetTag", a.getAssetTag(),
                        "categoryName", a.getCategory().getName(),
                        "updatedAt", a.getUpdatedAt().toString()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getValuationSummary() {
        java.math.BigDecimal totalPurchase = assetRepository.sumPurchasePrice().orElse(java.math.BigDecimal.ZERO);
        java.math.BigDecimal totalCurrent = assetRepository.sumCurrentValue().orElse(java.math.BigDecimal.ZERO);
        
        return Map.of(
                "totalPurchaseValue", totalPurchase,
                "totalCurrentValue", totalCurrent,
                "totalDepreciation", totalPurchase.subtract(totalCurrent)
        );
    }
}
