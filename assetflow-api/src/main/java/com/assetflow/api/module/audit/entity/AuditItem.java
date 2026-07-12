package com.assetflow.api.module.audit.entity;

import com.assetflow.api.module.asset.entity.Asset;
import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "audit_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_assignment_id", nullable = false)
    private AuditAssignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuditItemStatus status = AuditItemStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private AssetCondition condition;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private User verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
