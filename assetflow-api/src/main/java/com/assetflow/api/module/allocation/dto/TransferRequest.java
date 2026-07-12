package com.assetflow.api.module.allocation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TransferRequest {
    @NotNull(message = "New holder employee ID is required")
    private Long newHolderUserId;
    private LocalDate expectedReturnDate;
    private String notes;
}
