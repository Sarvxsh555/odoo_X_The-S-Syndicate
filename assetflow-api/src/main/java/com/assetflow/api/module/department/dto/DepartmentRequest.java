package com.assetflow.api.module.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "Department code is required")
    @Size(max = 50)
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Code must be uppercase letters, numbers, hyphens, or underscores")
    private String code;

    private String description;

    private Long parentId;

    private Long headUserId;

    private boolean active = true;
}
