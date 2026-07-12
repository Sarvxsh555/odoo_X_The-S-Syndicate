package com.assetflow.api.module.user.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.DuplicateResourceException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.auth.entity.UserRole;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.department.entity.Department;
import com.assetflow.api.module.department.repository.DepartmentRepository;
import com.assetflow.api.module.user.dto.EmployeeRequest;
import com.assetflow.api.module.user.dto.EmployeeResponse;
import com.assetflow.api.module.user.entity.EmployeeProfile;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeProfileRepository employeeProfileRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> getAllEmployees(String search, Long departmentId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("firstName").ascending());
        Page<EmployeeProfile> profiles = employeeProfileRepository.findAllWithFilters(search, departmentId, pageRequest);
        return PageResponse.of(profiles.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        EmployeeProfile profile = employeeProfileRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        return toResponse(profile);
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(
                        request.getPassword() != null ? request.getPassword() : "TempPass@123"
                ))
                .role(UserRole.ROLE_EMPLOYEE)
                .active(true)
                .build();
        user = userRepository.save(user);

        String empCode = "EMP-" + String.format("%04d", user.getId());

        EmployeeProfile profile = EmployeeProfile.builder()
                .user(user)
                .empCode(empCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .designation(request.getDesignation())
                .joinedDate(request.getJoinedDate())
                .deptHead(request.isDeptHead())
                .build();

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findByIdAndDeletedFalse(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
            profile.setDepartment(dept);
        }

        return toResponse(employeeProfileRepository.save(profile));
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        EmployeeProfile profile = employeeProfileRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhone(request.getPhone());
        profile.setDesignation(request.getDesignation());
        profile.setJoinedDate(request.getJoinedDate());
        profile.setDeptHead(request.isDeptHead());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findByIdAndDeletedFalse(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
            profile.setDepartment(dept);
        } else {
            profile.setDepartment(null);
        }

        return toResponse(employeeProfileRepository.save(profile));
    }

    @Transactional
    public void deleteEmployee(Long id) {
        EmployeeProfile profile = employeeProfileRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));

        User user = profile.getUser();
        if (user.getRole() == UserRole.ROLE_ADMIN) {
            throw new BusinessException("Cannot delete admin users");
        }

        profile.setDeleted(true);
        profile.setDeletedAt(Instant.now());
        user.setActive(false);
        user.setDeleted(true);
        user.setDeletedAt(Instant.now());

        employeeProfileRepository.save(profile);
        userRepository.save(user);
    }

    @Transactional
    public EmployeeResponse promoteToAdmin(Long id) {
        EmployeeProfile profile = employeeProfileRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        User user = profile.getUser();
        user.setRole(UserRole.ROLE_ADMIN);
        userRepository.save(user);
        return toResponse(profile);
    }

    private EmployeeResponse toResponse(EmployeeProfile profile) {
        User user = profile.getUser();
        return EmployeeResponse.builder()
                .id(profile.getId())
                .empCode(profile.getEmpCode())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .fullName(profile.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(profile.getPhone())
                .departmentId(profile.getDepartment() != null ? profile.getDepartment().getId() : null)
                .departmentName(profile.getDepartment() != null ? profile.getDepartment().getName() : null)
                .designation(profile.getDesignation())
                .joinedDate(profile.getJoinedDate())
                .avatarUrl(profile.getAvatarUrl())
                .deptHead(profile.isDeptHead())
                .active(user.isActive())
                .createdAt(profile.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
