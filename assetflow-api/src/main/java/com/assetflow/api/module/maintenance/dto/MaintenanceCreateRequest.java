package com.assetflow.api.module.maintenance.dto;

import com.assetflow.api.module.maintenance.entity.MaintenancePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaintenanceCreateRequest {
    @NotNull private Long assetId;
    @NotBlank private String title;
    private String description;
    @NotNull private MaintenancePriority priority;
    private LocalDate scheduledDate;
    private BigDecimal estimatedCost;
}
