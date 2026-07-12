package com.assetflow.api.module.asset.repository;

import com.assetflow.api.module.asset.entity.AssetDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetDocumentRepository extends JpaRepository<AssetDocument, Long> {
    List<AssetDocument> findByAssetId(Long assetId);
    Optional<AssetDocument> findByIdAndAssetId(Long id, Long assetId);
}
