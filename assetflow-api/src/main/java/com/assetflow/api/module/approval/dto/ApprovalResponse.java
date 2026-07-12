package com.assetflow.api.module.approval.dto;

import com.assetflow.api.module.approval.entity.ApprovalStatus;
import com.assetflow.api.module.approval.entity.ApprovalType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApprovalResponse {
    private Long id;
    private UUID uuid;
    private ApprovalType type;
    private Long entityId;
    private String entityType;
    private Long requestedByUserId;
    private String requestedByName;
    private Long approvedByUserId;
    private String approvedByName;
    private ApprovalStatus status;
    private String title;
    private String description;
    private String notes;
    private String resolutionNotes;
    private Instant createdAt;
    private Instant resolvedAt;
}
