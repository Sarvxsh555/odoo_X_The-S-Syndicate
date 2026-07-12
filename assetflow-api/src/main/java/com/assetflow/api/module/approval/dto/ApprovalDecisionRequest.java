package com.assetflow.api.module.approval.dto;

import com.assetflow.api.module.approval.entity.ApprovalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalDecisionRequest {
    @NotNull private ApprovalStatus status;
    private String resolutionNotes;
}
