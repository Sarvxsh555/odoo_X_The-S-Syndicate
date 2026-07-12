package com.assetflow.api.module.user.repository;

import com.assetflow.api.module.user.entity.EmployeeProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {

    Optional<EmployeeProfile> findByUserIdAndDeletedFalse(Long userId);

    Optional<EmployeeProfile> findByIdAndDeletedFalse(Long id);

    boolean existsByEmpCodeAndDeletedFalse(String empCode);

    @Query("""
        SELECT e FROM EmployeeProfile e
        LEFT JOIN FETCH e.user u
        LEFT JOIN FETCH e.department d
        WHERE e.deleted = FALSE
        AND (:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(e.empCode) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:departmentId IS NULL OR d.id = :departmentId)
    """)
    Page<EmployeeProfile> findAllWithFilters(
            @Param("search") String search,
            @Param("departmentId") Long departmentId,
            Pageable pageable
    );

    long countByDeletedFalse();

    long countByDepartmentIdAndDeletedFalse(Long departmentId);
}
