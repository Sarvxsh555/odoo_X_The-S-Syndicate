package com.assetflow.api.module.search.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.module.search.dto.SearchResponse;
import com.assetflow.api.module.search.service.GlobalSearchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Global cross-entity search endpoint")
public class SearchController {

    private final GlobalSearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(searchService.search(q)));
    }
}
