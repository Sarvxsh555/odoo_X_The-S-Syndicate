package com.assetflow.api.module.maintenance.repository;

import com.assetflow.api.module.maintenance.entity.MaintenancePriority;
import com.assetflow.api.module.maintenance.entity.MaintenanceRequest;
import com.assetflow.api.module.maintenance.entity.MaintenanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {

    @Query("""
        SELECT m FROM MaintenanceRequest m
        LEFT JOIN FETCH m.asset a
        WHERE (:assetId IS NULL OR a.id = :assetId)
        AND (:status IS NULL OR m.status = :status)
        AND (:priority IS NULL OR m.priority = :priority)
    """)
    Page<MaintenanceRequest> findAllWithFilters(
            @Param("assetId") Long assetId,
            @Param("status") MaintenanceStatus status,
            @Param("priority") MaintenancePriority priority,
            Pageable pageable
    );

    long countByStatus(MaintenanceStatus status);

    @Query("SELECT m.status, COUNT(m) FROM MaintenanceRequest m GROUP BY m.status")
    List<Object[]> countByStatus();

    @Query("SELECT m.priority, COUNT(m) FROM MaintenanceRequest m WHERE m.status NOT IN ('RESOLVED', 'CANCELLED') GROUP BY m.priority")
    List<Object[]> countActivByPriority();
}
