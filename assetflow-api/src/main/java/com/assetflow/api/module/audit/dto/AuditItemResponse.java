package com.assetflow.api.module.audit.dto;

import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.audit.entity.AuditItemStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditItemResponse {
    private Long id;
    private Long assignmentId;
    private Long assetId;
    private String assetName;
    private String assetTag;
    private String assetSerialNumber;
    private AuditItemStatus status;
    private AssetCondition condition;
    private String notes;
    private Long verifiedByUserId;
    private String verifiedByName;
    private Instant verifiedAt;
    private Instant createdAt;
}
