package com.assetflow.api.module.department.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DepartmentResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private Long parentId;
    private String parentName;
    private HeadInfo head;
    private boolean active;
    private long employeeCount;
    private Instant createdAt;
    private List<DepartmentResponse> children;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeadInfo {
        private Long id;
        private String fullName;
        private String email;
        private String avatarUrl;
    }
}
