package com.assetflow.api.module.asset.dto;

import com.assetflow.api.module.asset.entity.AssetCondition;
import com.assetflow.api.module.asset.entity.AssetStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AssetResponse {
    private Long id;
    private String assetTag;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private AssetStatus status;
    private AssetCondition condition;
    private String location;
    private Long departmentId;
    private String departmentName;
    private String serialNumber;
    private String model;
    private String manufacturer;
    private String vendor;
    private LocalDate purchaseDate;
    private BigDecimal purchasePrice;
    private BigDecimal currentValue;
    private LocalDate warrantyExpiry;
    private boolean warrantyExpired;
    private int warrantyDaysLeft;
    private String notes;
    private Map<String, String> customFields;
    private Integer healthScore;
    private String primaryImageUrl;
    private List<ImageInfo> images;
    private List<DocumentInfo> documents;
    private QrInfo qrCode;
    private Instant createdAt;
    private Instant updatedAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ImageInfo {
        private Long id;
        private String url;
        private String filename;
        private boolean primary;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DocumentInfo {
        private Long id;
        private String name;
        private String docType;
        private String url;
        private String filename;
        private Long sizeBytes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QrInfo {
        private String qrData;
        private String qrImageUrl;
    }
}
