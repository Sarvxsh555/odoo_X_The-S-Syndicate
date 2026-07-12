package com.assetflow.api.module.asset.repository;

import com.assetflow.api.module.asset.entity.Asset;
import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.asset.entity.AssetStatus;
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
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findByIdAndDeletedFalse(Long id);

    Optional<Asset> findByAssetTagAndDeletedFalse(String assetTag);

    @Query("""
        SELECT a FROM Asset a
        LEFT JOIN FETCH a.category
        LEFT JOIN FETCH a.department
        LEFT JOIN FETCH a.createdBy
        WHERE a.id = :id AND a.deleted = FALSE
    """)
    Optional<Asset> findByIdWithDetails(@Param("id") Long id);

    @Query("""
        SELECT a FROM Asset a
        LEFT JOIN FETCH a.department d
        WHERE a.deleted = FALSE
        AND (:departmentId IS NULL OR d.id = :departmentId)
    """)
    List<Asset> findAuditableAssets(@Param("departmentId") Long departmentId);

    boolean existsByAssetTagAndDeletedFalse(String assetTag);

    boolean existsBySerialNumberAndDeletedFalse(String serialNumber);

    @Query("""
        SELECT a FROM Asset a
        LEFT JOIN FETCH a.category c
        LEFT JOIN FETCH a.department d
        WHERE a.deleted = FALSE
        AND (:search IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(a.assetTag) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(a.model) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categoryId IS NULL OR c.id = :categoryId)
        AND (:status IS NULL OR a.status = :status)
        AND (:condition IS NULL OR a.condition = :condition)
        AND (:departmentId IS NULL OR d.id = :departmentId)
    """)
    Page<Asset> findAllWithFilters(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("status") AssetStatus status,
            @Param("condition") AssetCondition condition,
            @Param("departmentId") Long departmentId,
            Pageable pageable
    );

    // Dashboard queries
    long countByDeletedFalse();

    long countByStatusAndDeletedFalse(AssetStatus status);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.deleted = FALSE AND a.warrantyExpiry BETWEEN :start AND :end")
    long countWarrantyExpiringBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a FROM Asset a WHERE a.deleted = FALSE AND a.warrantyExpiry BETWEEN :start AND :end ORDER BY a.warrantyExpiry ASC")
    List<Asset> findWarrantyExpiringBetween(@Param("start") LocalDate start, @Param("end") LocalDate end, Pageable pageable);

    @Query("SELECT a.department.name, COUNT(a) FROM Asset a WHERE a.deleted = FALSE AND a.department IS NOT NULL GROUP BY a.department.name ORDER BY COUNT(a) DESC")
    List<Object[]> countByDepartment();

    @Query("SELECT a.status, COUNT(a) FROM Asset a WHERE a.deleted = FALSE GROUP BY a.status")
    List<Object[]> countByStatus();

    @Query("SELECT a.category.name, COUNT(a) FROM Asset a WHERE a.deleted = FALSE GROUP BY a.category.name ORDER BY COUNT(a) DESC")
    List<Object[]> countByCategory();
}
