package com.assetflow.api.module.department.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.module.department.dto.DepartmentRequest;
import com.assetflow.api.module.department.dto.DepartmentResponse;
import com.assetflow.api.module.department.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department management and hierarchy")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @Operation(summary = "Get all departments with pagination and search")
    public ResponseEntity<ApiResponse<PageResponse<DepartmentResponse>>> getAllDepartments(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(departmentService.getAllDepartments(search, page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(departmentService.getDepartmentById(id)));
    }

    @GetMapping("/hierarchy")
    @Operation(summary = "Get full department hierarchy tree")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getHierarchy() {
        return ResponseEntity.ok(ApiResponse.success(departmentService.getHierarchy()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new department (Admin only)")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        DepartmentResponse response = departmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Department created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a department (Admin only)")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Department updated", departmentService.updateDepartment(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete a department (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted"));
    }

    @PutMapping("/{id}/head")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Set department head (Admin only)")
    public ResponseEntity<ApiResponse<DepartmentResponse>> setHead(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Department head updated", departmentService.setDepartmentHead(id, userId)));
    }
}
