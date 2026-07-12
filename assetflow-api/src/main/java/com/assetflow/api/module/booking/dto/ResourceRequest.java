package com.assetflow.api.module.booking.dto;

import com.assetflow.api.module.booking.entity.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {
    @NotBlank private String name;
    @NotNull private ResourceType type;
    private String location;
    private Integer capacity;
    private String description;
}
