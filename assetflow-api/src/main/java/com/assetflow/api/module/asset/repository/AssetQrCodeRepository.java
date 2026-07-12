package com.assetflow.api.module.asset.repository;

import com.assetflow.api.module.asset.entity.AssetQrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssetQrCodeRepository extends JpaRepository<AssetQrCode, Long> {
    Optional<AssetQrCode> findByAssetId(Long assetId);
}
