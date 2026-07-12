package com.assetflow.api.module.category.repository;

import com.assetflow.api.module.category.entity.AssetCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {

    Optional<AssetCategory> findByIdAndDeletedFalse(Long id);

    boolean existsByCodeAndDeletedFalse(String code);

    boolean existsByCodeAndDeletedFalseAndIdNot(String code, Long id);

    @Query("""
        SELECT c FROM AssetCategory c
        WHERE c.deleted = FALSE
        AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))
             OR LOWER(c.code) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))
    """)
    Page<AssetCategory> findAllWithSearch(@Param("search") String search, Pageable pageable);

    List<AssetCategory> findByDeletedFalseAndActiveTrue();

    @Query("SELECT c FROM AssetCategory c WHERE c.parent IS NULL AND c.deleted = FALSE ORDER BY c.name")
    List<AssetCategory> findRootCategories();
}
