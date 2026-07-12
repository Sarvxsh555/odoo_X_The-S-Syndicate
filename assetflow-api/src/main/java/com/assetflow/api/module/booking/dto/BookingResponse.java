package com.assetflow.api.module.booking.dto;

import com.assetflow.api.module.booking.entity.BookingStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private Long bookedByUserId;
    private String bookedByName;
    private String title;
    private String description;
    private Instant startDatetime;
    private Instant endDatetime;
    private BookingStatus status;
    private String notes;
    private String cancelledReason;
    private Instant createdAt;
}
