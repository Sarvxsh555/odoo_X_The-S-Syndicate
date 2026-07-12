package com.assetflow.api.module.asset.dto;

import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.asset.entity.AssetStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
public class AssetRequest {

    @NotBlank(message = "Asset name is required")
    private String name;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private AssetCondition condition = AssetCondition.GOOD;

    private String location;

    private Long departmentId;

    private String serialNumber;

    private String model;

    private String manufacturer;

    private String vendor;

    private LocalDate purchaseDate;

    @Positive(message = "Purchase price must be positive")
    private BigDecimal purchasePrice;

    private LocalDate warrantyExpiry;

    private String notes;

    private Map<String, String> customFields;
}
