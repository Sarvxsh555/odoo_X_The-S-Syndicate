package com.assetflow.api.module.audit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AuditCreateRequest {
    @NotBlank private String name;
    private String description;
    @NotNull private LocalDate startDate;
    private LocalDate endDate;
}
