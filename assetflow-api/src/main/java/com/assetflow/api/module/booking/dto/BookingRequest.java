package com.assetflow.api.module.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.Instant;

@Data
public class BookingRequest {
    @NotNull private Long resourceId;
    @NotBlank private String title;
    private String description;
    @NotNull private Instant startDatetime;
    @NotNull private Instant endDatetime;
    private String notes;
}
