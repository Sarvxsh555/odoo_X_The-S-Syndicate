package com.assetflow.api.module.approval.dto;

import com.assetflow.api.module.approval.entity.ApprovalType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalCreateRequest {
    @NotNull private ApprovalType type;
    @NotNull private Long entityId;
    @NotBlank private String entityType;
    @NotBlank private String title;
    private String description;
}
