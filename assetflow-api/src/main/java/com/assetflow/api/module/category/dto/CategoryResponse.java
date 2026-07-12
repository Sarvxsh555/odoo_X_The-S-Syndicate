package com.assetflow.api.module.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private UUID uuid;
    private String name;
    private String code;
    private String description;
    private Long parentId;
    private String parentName;
    private BigDecimal depreciationRate;
    private Integer usefulLifeYears;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
