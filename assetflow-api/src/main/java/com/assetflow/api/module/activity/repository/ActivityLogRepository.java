package com.assetflow.api.module.activity.repository;

import com.assetflow.api.module.activity.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("""
        SELECT al FROM ActivityLog al
        LEFT JOIN FETCH al.user u
        WHERE (:userId IS NULL OR u.id = :userId)
        AND (:entityType IS NULL OR al.entityType = :entityType)
    """)
    Page<ActivityLog> findAllWithFilters(
            @Param("userId") Long userId,
            @Param("entityType") String entityType,
            Pageable pageable
    );
}
