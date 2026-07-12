package com.assetflow.api.module.audit.repository;

import com.assetflow.api.module.audit.entity.AuditItem;
import com.assetflow.api.module.audit.entity.AuditItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditItemRepository extends JpaRepository<AuditItem, Long> {
    List<AuditItem> findByAssignmentId(Long assignmentId);
    long countByAssignmentIdAndStatus(Long assignmentId, AuditItemStatus status);
}
