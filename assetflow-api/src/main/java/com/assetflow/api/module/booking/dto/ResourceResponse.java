package com.assetflow.api.module.booking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResourceResponse {
    private Long id;
    private String name;
    private String type;
    private String location;
    private Integer capacity;
    private String description;
    private boolean active;
}
