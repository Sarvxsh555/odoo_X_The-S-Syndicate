package com.assetflow.api.module.allocation.dto;

import com.assetflow.api.module.asset.entity.AssetCondition;
import lombok.Data;

@Data
public class ReturnRequest {
    private AssetCondition conditionAtReturn;
    private String notes;
}
