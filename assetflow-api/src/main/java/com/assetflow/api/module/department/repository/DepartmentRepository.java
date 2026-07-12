package com.assetflow.api.module.department.repository;

import com.assetflow.api.module.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByIdAndDeletedFalse(Long id);

    boolean existsByCodeAndDeletedFalse(String code);

    boolean existsByCodeAndDeletedFalseAndIdNot(String code, Long id);

    @Query("""
        SELECT d FROM Department d
        LEFT JOIN FETCH d.head
        WHERE d.deleted = FALSE
        AND (:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Department> findAllWithSearch(@Param("search") String search, Pageable pageable);

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.children c WHERE d.parent IS NULL AND d.deleted = FALSE")
    List<Department> findRootDepartmentsWithChildren();

    List<Department> findByDeletedFalseAndActiveTrue();

    long countByDeletedFalse();
}
