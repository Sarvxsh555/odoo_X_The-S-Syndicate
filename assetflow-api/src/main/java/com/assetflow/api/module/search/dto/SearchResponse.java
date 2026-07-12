package com.assetflow.api.module.search.dto;

import com.assetflow.api.module.asset.dto.AssetResponse;
import com.assetflow.api.module.user.dto.EmployeeResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SearchResponse {
    private List<AssetResponse> assets;
    private List<EmployeeResponse> employees;
}
