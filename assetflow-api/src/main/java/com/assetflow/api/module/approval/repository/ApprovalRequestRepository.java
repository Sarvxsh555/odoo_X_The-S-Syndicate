package com.assetflow.api.module.approval.repository;

import com.assetflow.api.module.approval.entity.ApprovalRequest;
import com.assetflow.api.module.approval.entity.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {

    @Query("""
        SELECT a FROM ApprovalRequest a
        LEFT JOIN FETCH a.requestedBy r
        WHERE (:status IS NULL OR a.status = :status)
    """)
    Page<ApprovalRequest> findAllWithFilters(@Param("status") ApprovalStatus status, Pageable pageable);
}
