package com.assetflow.api.module.category.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.DuplicateResourceException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.category.dto.CategoryRequest;
import com.assetflow.api.module.category.dto.CategoryResponse;
import com.assetflow.api.module.category.entity.AssetCategory;
import com.assetflow.api.module.category.repository.AssetCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final AssetCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> getAllCategories(String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<AssetCategory> categories = categoryRepository.findAllWithSearch(search, pageRequest);
        return PageResponse.of(categories.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        AssetCategory category = categoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByCodeAndDeletedFalse(request.getCode())) {
            throw new DuplicateResourceException("Category", "code", request.getCode());
        }

        AssetCategory category = AssetCategory.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .depreciationRate(request.getDepreciationRate())
                .usefulLifeYears(request.getUsefulLifeYears())
                .active(request.isActive())
                .build();

        if (request.getParentId() != null) {
            AssetCategory parent = categoryRepository.findByIdAndDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category", request.getParentId()));
            category.setParent(parent);
        }

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        AssetCategory category = categoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (categoryRepository.existsByCodeAndDeletedFalseAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Category", "code", request.getCode());
        }

        category.setName(request.getName());
        category.setCode(request.getCode().toUpperCase());
        category.setDescription(request.getDescription());
        category.setDepreciationRate(request.getDepreciationRate());
        category.setUsefulLifeYears(request.getUsefulLifeYears());
        category.setActive(request.isActive());

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BusinessException("A category cannot be its own parent");
            }
            AssetCategory parent = categoryRepository.findByIdAndDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category", request.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        AssetCategory category = categoryRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        // Logic check: if category has subcategories or is in use, handle constraints
        // For simplicity of soft delete, we'll mark as deleted:
        category.setDeleted(true);
        category.setDeletedAt(Instant.now());
        categoryRepository.save(category);
    }

    private CategoryResponse toResponse(AssetCategory category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .uuid(category.getUuid())
                .name(category.getName())
                .code(category.getCode())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .depreciationRate(category.getDepreciationRate())
                .usefulLifeYears(category.getUsefulLifeYears())
                .active(category.isActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
