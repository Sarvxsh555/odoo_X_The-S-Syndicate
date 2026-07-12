package com.assetflow.api.module.search.service;

import com.assetflow.api.module.asset.dto.AssetResponse;
import com.assetflow.api.module.asset.repository.AssetRepository;
import com.assetflow.api.module.search.dto.SearchResponse;
import com.assetflow.api.module.user.dto.EmployeeResponse;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GlobalSearchService {

    private final AssetRepository assetRepository;
    private final EmployeeProfileRepository employeeProfileRepository;

    @Transactional(readOnly = true)
    public SearchResponse search(String query) {
        PageRequest limit = PageRequest.of(0, 10);

        List<AssetResponse> assets = assetRepository.findAllWithFilters(query, null, null, null, null, limit)
                .getContent().stream()
                .map(a -> AssetResponse.builder()
                        .id(a.getId())
                        .name(a.getName())
                        .assetTag(a.getAssetTag())
                        .status(a.getStatus())
                        .condition(a.getCondition())
                        .categoryName(a.getCategory().getName())
                        .departmentName(a.getDepartment() != null ? a.getDepartment().getName() : null)
                        .build())
                .collect(Collectors.toList());

        List<EmployeeResponse> employees = employeeProfileRepository.findAllWithFilters(query, null, limit)
                .getContent().stream()
                .map(ep -> EmployeeResponse.builder()
                        .id(ep.getId())
                        .fullName(ep.getFullName())
                        .firstName(ep.getFirstName())
                        .lastName(ep.getLastName())
                        .email(ep.getUser().getEmail())
                        .empCode(ep.getEmpCode())
                        .designation(ep.getDesignation())
                        .departmentName(ep.getDepartment() != null ? ep.getDepartment().getName() : null)
                        .role(ep.getUser().getRole())
                        .active(ep.getUser().isActive())
                        .build())
                .collect(Collectors.<EmployeeResponse>toList());

        return SearchResponse.builder()
                .assets(assets)
                .employees(employees)
                .build();
    }
}
