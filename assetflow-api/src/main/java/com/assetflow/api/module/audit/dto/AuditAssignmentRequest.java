package com.assetflow.api.module.audit.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuditAssignmentRequest {
    @NotNull private Long auditorUserId;
    private Long departmentId;
    private String location;
    private String notes;
}
