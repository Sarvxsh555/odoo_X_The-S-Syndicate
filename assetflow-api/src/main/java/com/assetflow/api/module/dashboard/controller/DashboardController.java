package com.assetflow.api.module.dashboard.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.module.dashboard.dto.DashboardStatsResponse;
import com.assetflow.api.module.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Enterprise dashboard statistics and analytics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStats()));
    }

    @GetMapping("/department-distribution")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDeptDistribution() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDepartmentDistribution()));
    }

    @GetMapping("/asset-status")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAssetStatus() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAssetStatusBreakdown()));
    }

    @GetMapping("/maintenance-trends")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMaintenanceTrends() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMaintenanceTrends()));
    }

    @GetMapping("/expiring-warranties")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getExpiringWarranties() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getExpiringWarranties()));
    }

    @GetMapping("/upcoming-returns")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUpcomingReturns() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getUpcomingReturns()));
    }

    @GetMapping("/idle-assets")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getIdleAssets() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getIdleAssets()));
    }

    @GetMapping("/valuation-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getValuationSummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getValuationSummary()));
    }
}
