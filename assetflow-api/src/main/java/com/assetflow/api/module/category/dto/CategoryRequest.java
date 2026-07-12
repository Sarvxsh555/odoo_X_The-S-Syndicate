package com.assetflow.api.module.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "Category code is required")
    @Size(max = 50)
    private String code;

    private String description;

    private Long parentId;

    private BigDecimal depreciationRate;

    private Integer usefulLifeYears;

    private boolean active = true;
}
