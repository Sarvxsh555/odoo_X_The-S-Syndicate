package com.assetflow.api.module.allocation.repository;

import com.assetflow.api.module.allocation.entity.Allocation;
import com.assetflow.api.module.allocation.entity.AllocationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    @Query("""
        SELECT a FROM Allocation a
        LEFT JOIN FETCH a.asset ast
        LEFT JOIN FETCH a.allocatedTo u
        LEFT JOIN FETCH a.allocatedBy b
        WHERE (:assetId IS NULL OR ast.id = :assetId)
        AND (:userId IS NULL OR u.id = :userId)
        AND (:status IS NULL OR a.status = :status)
    """)
    Page<Allocation> findAllWithFilters(
            @Param("assetId") Long assetId,
            @Param("userId") Long userId,
            @Param("status") AllocationStatus status,
            Pageable pageable
    );

    Optional<Allocation> findByAssetIdAndStatus(Long assetId, AllocationStatus status);

    boolean existsByAssetIdAndStatus(Long assetId, AllocationStatus status);

    // Dashboard queries
    @Query("SELECT a FROM Allocation a WHERE a.status = 'ACTIVE' AND a.expectedReturnDate <= :date ORDER BY a.expectedReturnDate ASC")
    List<Allocation> findOverdueAllocations(@Param("date") LocalDate date, Pageable pageable);

    @Query("SELECT a FROM Allocation a WHERE a.status = 'ACTIVE' AND a.expectedReturnDate BETWEEN :start AND :end ORDER BY a.expectedReturnDate ASC")
    List<Allocation> findUpcomingReturns(@Param("start") LocalDate start, @Param("end") LocalDate end, Pageable pageable);

    long countByStatus(AllocationStatus status);

    @Query("""
        SELECT a FROM Allocation a
        LEFT JOIN FETCH a.asset ast
        LEFT JOIN FETCH a.allocatedTo u
        LEFT JOIN FETCH a.department d
        ORDER BY a.createdAt DESC
    """)
    List<Allocation> findAllForReport();
}
