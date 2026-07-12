package com.assetflow.api.module.department.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.DuplicateResourceException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.department.dto.DepartmentRequest;
import com.assetflow.api.module.department.dto.DepartmentResponse;
import com.assetflow.api.module.department.entity.Department;
import com.assetflow.api.module.department.repository.DepartmentRepository;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;

    @Transactional(readOnly = true)
    public PageResponse<DepartmentResponse> getAllDepartments(String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Department> departments = departmentRepository.findAllWithSearch(search, pageRequest);
        return PageResponse.of(departments.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department dept = departmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        return toResponse(dept);
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByCodeAndDeletedFalse(request.getCode())) {
            throw new DuplicateResourceException("Department", "code", request.getCode());
        }

        Department dept = Department.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .active(request.isActive())
                .build();

        if (request.getParentId() != null) {
            Department parent = departmentRepository.findByIdAndDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent department", request.getParentId()));
            dept.setParent(parent);
        }

        if (request.getHeadUserId() != null) {
            User head = userRepository.findByEmailAndDeletedFalse(
                    userRepository.findById(request.getHeadUserId())
                            .orElseThrow(() -> new ResourceNotFoundException("User", request.getHeadUserId()))
                            .getEmail()
            ).orElseThrow(() -> new ResourceNotFoundException("User", request.getHeadUserId()));
            dept.setHead(head);
        }

        return toResponse(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));

        if (departmentRepository.existsByCodeAndDeletedFalseAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Department", "code", request.getCode());
        }

        dept.setName(request.getName());
        dept.setCode(request.getCode().toUpperCase());
        dept.setDescription(request.getDescription());
        dept.setActive(request.isActive());

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BusinessException("A department cannot be its own parent");
            }
            Department parent = departmentRepository.findByIdAndDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent department", request.getParentId()));
            dept.setParent(parent);
        } else {
            dept.setParent(null);
        }

        if (request.getHeadUserId() != null) {
            User head = userRepository.findById(request.getHeadUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getHeadUserId()));
            dept.setHead(head);
        } else {
            dept.setHead(null);
        }

        return toResponse(departmentRepository.save(dept));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));

        long employeeCount = employeeProfileRepository.countByDepartmentIdAndDeletedFalse(id);
        if (employeeCount > 0) {
            throw new BusinessException("Cannot delete department with " + employeeCount + " active employee(s). Reassign employees first.");
        }

        dept.setDeleted(true);
        dept.setDeletedAt(Instant.now());
        departmentRepository.save(dept);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getHierarchy() {
        List<Department> roots = departmentRepository.findRootDepartmentsWithChildren();
        return roots.stream().map(this::toResponseWithChildren).collect(Collectors.toList());
    }

    @Transactional
    public DepartmentResponse setDepartmentHead(Long id, Long userId) {
        Department dept = departmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        User head = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        dept.setHead(head);
        return toResponse(departmentRepository.save(dept));
    }

    private DepartmentResponse toResponse(Department dept) {
        long empCount = employeeProfileRepository.countByDepartmentIdAndDeletedFalse(dept.getId());

        DepartmentResponse.DepartmentResponseBuilder builder = DepartmentResponse.builder()
                .id(dept.getId())
                .name(dept.getName())
                .code(dept.getCode())
                .description(dept.getDescription())
                .active(dept.isActive())
                .employeeCount(empCount)
                .createdAt(dept.getCreatedAt());

        if (dept.getParent() != null) {
            builder.parentId(dept.getParent().getId())
                   .parentName(dept.getParent().getName());
        }

        if (dept.getHead() != null) {
            User head = dept.getHead();
            employeeProfileRepository.findByUserIdAndDeletedFalse(head.getId()).ifPresent(ep ->
                builder.head(DepartmentResponse.HeadInfo.builder()
                        .id(head.getId())
                        .fullName(ep.getFullName())
                        .email(head.getEmail())
                        .avatarUrl(ep.getAvatarUrl())
                        .build())
            );
        }

        return builder.build();
    }

    private DepartmentResponse toResponseWithChildren(Department dept) {
        DepartmentResponse response = toResponse(dept);
        if (dept.getChildren() != null && !dept.getChildren().isEmpty()) {
            response.setChildren(dept.getChildren().stream()
                    .filter(c -> !c.isDeleted())
                    .map(this::toResponseWithChildren)
                    .collect(Collectors.toList()));
        }
        return response;
    }
}
