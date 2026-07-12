package com.assetflow.api.module.maintenance.dto;

import com.assetflow.api.module.maintenance.entity.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaintenanceStatusRequest {
    @NotNull private MaintenanceStatus status;
    private String resolutionNotes;
    private BigDecimal actualCost;
}
