package com.assetflow.api.module.allocation.dto;

import com.assetflow.api.module.asset.entity.AssetCondition;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AllocateRequest {
    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "Employee ID is required")
    private Long allocatedToUserId;

    private Long departmentId;
    private LocalDate expectedReturnDate;
    private AssetCondition conditionAtAllocation;
    private String notes;
}
