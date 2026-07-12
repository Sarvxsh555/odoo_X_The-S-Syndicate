package com.assetflow.api.module.asset.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "asset_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(nullable = false, length = 500)
    private String url;

    private String filename;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private boolean primary = false;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;
}
