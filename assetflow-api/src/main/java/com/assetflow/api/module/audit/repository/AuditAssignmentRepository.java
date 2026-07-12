package com.assetflow.api.module.audit.repository;

import com.assetflow.api.module.audit.entity.AuditAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditAssignmentRepository extends JpaRepository<AuditAssignment, Long> {
    List<AuditAssignment> findByAuditCycleId(Long cycleId);
}
