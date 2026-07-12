package com.assetflow.api.module.user.dto;

import com.assetflow.api.module.auth.entity.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeResponse {
    private Long id;
    private String empCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private UserRole role;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String designation;
    private LocalDate joinedDate;
    private String avatarUrl;
    private boolean deptHead;
    private boolean active;
    private Instant createdAt;
    private Instant lastLoginAt;
}
