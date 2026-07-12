package com.assetflow.api.module.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsResponse {
    private long totalAssets;
    private long availableAssets;
    private long allocatedAssets;
    private long maintenanceAssets;
    private long totalEmployees;
    private long pendingMaintenance;
    private long activeAllocations;
    private long overdueAllocations;
    private long expiringWarranties30Days;
    private double assetUtilizationRate;
}
