package com.assetflow.api.module.user.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @Size(max = 20)
    private String phone;

    private Long departmentId;

    @Size(max = 255)
    private String designation;

    private LocalDate joinedDate;

    private boolean deptHead;

    // Only used on creation
    private String password;
}
