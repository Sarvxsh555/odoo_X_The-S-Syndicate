package com.assetflow.api.module.audit.dto;

import com.assetflow.api.module.audit.entity.AuditCycleStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditResponse {
    private Long id;
    private UUID uuid;
    private String name;
    private String description;
    private AuditCycleStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long createdByUserId;
    private String createdByName;
    private Long closedByUserId;
    private String closedByName;
    private Instant closedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
