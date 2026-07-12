package com.assetflow.api.module.asset.repository;

import com.assetflow.api.module.asset.entity.AssetImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetImageRepository extends JpaRepository<AssetImage, Long> {
    List<AssetImage> findByAssetIdOrderByPrimaryDesc(Long assetId);
    List<AssetImage> findByAssetIdInAndPrimaryTrue(List<Long> assetIds);
    Optional<AssetImage> findByIdAndAssetId(Long id, Long assetId);
    boolean existsByAssetIdAndPrimaryTrue(Long assetId);
}
