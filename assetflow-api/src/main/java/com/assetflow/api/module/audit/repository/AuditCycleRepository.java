package com.assetflow.api.module.audit.repository;

import com.assetflow.api.module.audit.entity.AuditCycle;
import com.assetflow.api.module.audit.entity.AuditCycleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditCycleRepository extends JpaRepository<AuditCycle, Long> {
    Page<AuditCycle> findByStatus(AuditCycleStatus status, Pageable pageable);
    Page<AuditCycle> findAll(Pageable pageable);
}
