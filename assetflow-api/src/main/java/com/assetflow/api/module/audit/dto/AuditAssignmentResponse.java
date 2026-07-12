package com.assetflow.api.module.audit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditAssignmentResponse {
    private Long id;
    private UUID uuid;
    private Long auditCycleId;
    private String auditCycleName;
    private Long auditorUserId;
    private String auditorName;
    private Long departmentId;
    private String departmentName;
    private String location;
    private String notes;
    private Instant createdAt;
}
