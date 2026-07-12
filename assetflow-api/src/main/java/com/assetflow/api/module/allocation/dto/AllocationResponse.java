package com.assetflow.api.module.allocation.dto;

import com.assetflow.api.module.allocation.entity.AllocationStatus;
import com.assetflow.api.module.asset.entity.AssetCondition;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AllocationResponse {
    private Long id;
    private Long assetId;
    private String assetTag;
    private String assetName;
    private Long allocatedToUserId;
    private String allocatedToName;
    private Long allocatedByUserId;
    private String allocatedByName;
    private Long departmentId;
    private String departmentName;
    private AllocationStatus status;
    private Instant allocationDate;
    private LocalDate expectedReturnDate;
    private Instant actualReturnDate;
    private AssetCondition conditionAtAllocation;
    private AssetCondition conditionAtReturn;
    private String notes;
    private String returnNotes;
    private List<PhotoInfo> photos;
    private Instant createdAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PhotoInfo {
        private Long id;
        private String url;
        private String photoType;
    }
}
