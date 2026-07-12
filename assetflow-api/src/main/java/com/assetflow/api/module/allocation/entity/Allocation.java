package com.assetflow.api.module.allocation.entity;

import com.assetflow.api.module.asset.entity.Asset;
import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.department.entity.Department;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_to_user_id", nullable = false)
    private User allocatedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_by_user_id", nullable = false)
    private User allocatedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AllocationStatus status = AllocationStatus.ACTIVE;

    @Column(name = "allocation_date", nullable = false)
    @Builder.Default
    private Instant allocationDate = Instant.now();

    @Column(name = "expected_return_date")
    private LocalDate expectedReturnDate;

    @Column(name = "actual_return_date")
    private Instant actualReturnDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_at_allocation")
    private AssetCondition conditionAtAllocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_at_return")
    private AssetCondition conditionAtReturn;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "return_notes", columnDefinition = "TEXT")
    private String returnNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "returned_to_user_id")
    private User returnedTo;

    @OneToMany(mappedBy = "allocation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AllocationPhoto> photos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (uuid == null) uuid = UUID.randomUUID();
    }
}
