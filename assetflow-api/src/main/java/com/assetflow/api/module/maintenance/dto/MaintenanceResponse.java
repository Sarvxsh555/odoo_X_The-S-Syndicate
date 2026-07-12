package com.assetflow.api.module.maintenance.dto;

import com.assetflow.api.module.maintenance.entity.MaintenancePriority;
import com.assetflow.api.module.maintenance.entity.MaintenanceStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MaintenanceResponse {
    private Long id;
    private Long assetId;
    private String assetTag;
    private String assetName;
    private Long requestedByUserId;
    private String requestedByName;
    private Long assignedTechnicianId;
    private MaintenancePriority priority;
    private MaintenanceStatus status;
    private String title;
    private String description;
    private String resolutionNotes;
    private LocalDate scheduledDate;
    private Instant completedDate;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private Instant createdAt;
    private Instant updatedAt;
}
