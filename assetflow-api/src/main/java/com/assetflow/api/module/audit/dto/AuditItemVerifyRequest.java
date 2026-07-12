package com.assetflow.api.module.audit.dto;

import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.audit.entity.AuditItemStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuditItemVerifyRequest {
    @NotNull private AuditItemStatus status;
    private AssetCondition condition;
    private String notes;
}
