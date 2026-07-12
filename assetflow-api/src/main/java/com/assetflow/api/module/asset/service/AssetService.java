package com.assetflow.api.module.asset.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.DuplicateResourceException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.config.StorageProperties;
import com.assetflow.api.module.asset.dto.AssetRequest;
import com.assetflow.api.module.asset.dto.AssetResponse;
import com.assetflow.api.module.asset.entity.*;
import com.assetflow.api.module.asset.repository.*;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.auth.security.UserPrincipal;
import com.assetflow.api.module.category.entity.AssetCategory;
import com.assetflow.api.module.category.repository.AssetCategoryRepository;
import com.assetflow.api.module.department.entity.Department;
import com.assetflow.api.module.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetImageRepository imageRepository;
    private final AssetDocumentRepository documentRepository;
    private final AssetQrCodeRepository qrCodeRepository;
    private final AssetCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final QrCodeService qrCodeService;

    @Transactional(readOnly = true)
    public PageResponse<AssetResponse> getAllAssets(
            String search, Long categoryId, AssetStatus status,
            AssetCondition condition, Long departmentId,
            String sortBy, String sortDir, int page, int size) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<Asset> assets = assetRepository.findAllWithFilters(
                search, categoryId, status, condition, departmentId, pageRequest);
        List<Long> assetIds = assets.getContent().stream().map(Asset::getId).toList();
        Map<Long, AssetImage> primaryImages = assetIds.isEmpty()
                ? Map.of()
                : imageRepository.findByAssetIdInAndPrimaryTrue(assetIds).stream()
                        .collect(Collectors.toMap(img -> img.getAsset().getId(), Function.identity(), (first, ignored) -> first));
        return PageResponse.of(assets.map(asset -> toSummaryResponse(asset, primaryImages.get(asset.getId()))));
    }

    @Transactional(readOnly = true)
    public AssetResponse getAssetById(Long id) {
        Asset asset = assetRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", id));
        return toDetailResponse(asset);
    }

    @Transactional
    public AssetResponse createAsset(AssetRequest request, Long creatorUserId) {
        AssetCategory category = categoryRepository.findByIdAndDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()) {
            if (assetRepository.existsBySerialNumberAndDeletedFalse(request.getSerialNumber())) {
                throw new DuplicateResourceException("Asset", "serial number", request.getSerialNumber());
            }
        }

        User creator = userRepository.findById(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", creatorUserId));

        Asset asset = Asset.builder()
                .assetTag(generateAssetTag(category))
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .status(AssetStatus.AVAILABLE)
                .condition(request.getCondition() != null ? request.getCondition() : AssetCondition.GOOD)
                .location(request.getLocation())
                .serialNumber(request.getSerialNumber())
                .model(request.getModel())
                .manufacturer(request.getManufacturer())
                .vendor(request.getVendor())
                .purchaseDate(request.getPurchaseDate())
                .purchasePrice(request.getPurchasePrice())
                .currentValue(request.getPurchasePrice())
                .warrantyExpiry(request.getWarrantyExpiry())
                .notes(request.getNotes())
                .createdBy(creator)
                .build();

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findByIdAndDeletedFalse(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
            asset.setDepartment(dept);
        }

        asset = assetRepository.save(asset);

        // Auto-generate QR code
        generateAndSaveQrCode(asset);

        return toDetailResponse(asset);
    }

    @Transactional
    public AssetResponse updateAsset(Long id, AssetRequest request) {
        Asset asset = assetRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", id));

        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()
                && !request.getSerialNumber().equals(asset.getSerialNumber())) {
            if (assetRepository.existsBySerialNumberAndDeletedFalse(request.getSerialNumber())) {
                throw new DuplicateResourceException("Asset", "serial number", request.getSerialNumber());
            }
        }

        AssetCategory category = categoryRepository.findByIdAndDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        asset.setName(request.getName());
        asset.setDescription(request.getDescription());
        asset.setCategory(category);
        asset.setCondition(request.getCondition());
        asset.setLocation(request.getLocation());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setModel(request.getModel());
        asset.setManufacturer(request.getManufacturer());
        asset.setVendor(request.getVendor());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setPurchasePrice(request.getPurchasePrice());
        asset.setWarrantyExpiry(request.getWarrantyExpiry());
        asset.setNotes(request.getNotes());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findByIdAndDeletedFalse(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", request.getDepartmentId()));
            asset.setDepartment(dept);
        } else {
            asset.setDepartment(null);
        }

        return toDetailResponse(assetRepository.save(asset));
    }

    @Transactional
    public void deleteAsset(Long id) {
        Asset asset = assetRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", id));

        if (asset.getStatus() == AssetStatus.ALLOCATED) {
            throw new BusinessException("Cannot delete an allocated asset. Return it first.");
        }

        asset.setDeleted(true);
        asset.setDeletedAt(Instant.now());
        assetRepository.save(asset);
    }

    @Transactional
    public AssetResponse.ImageInfo addImage(Long assetId, MultipartFile file, boolean isPrimary) {
        Asset asset = assetRepository.findByIdAndDeletedFalse(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", assetId));

        if (isPrimary) {
            imageRepository.findByAssetIdOrderByPrimaryDesc(assetId).stream()
                    .filter(AssetImage::isPrimary)
                    .forEach(img -> { img.setPrimary(false); imageRepository.save(img); });
        }

        String url = storageService.store(file, "assets/images");
        AssetImage image = AssetImage.builder()
                .asset(asset)
                .url(url)
                .filename(file.getOriginalFilename())
                .primary(isPrimary || !imageRepository.existsByAssetIdAndPrimaryTrue(assetId))
                .build();

        image = imageRepository.save(image);
        return AssetResponse.ImageInfo.builder()
                .id(image.getId())
                .url(image.getUrl())
                .filename(image.getFilename())
                .primary(image.isPrimary())
                .build();
    }

    @Transactional
    public void deleteImage(Long assetId, Long imageId) {
        AssetImage image = imageRepository.findByIdAndAssetId(imageId, assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Image", imageId));
        storageService.delete(image.getUrl());
        imageRepository.delete(image);
    }

    @Transactional
    public AssetResponse.DocumentInfo addDocument(Long assetId, MultipartFile file, String name, String docType) {
        Asset asset = assetRepository.findByIdAndDeletedFalse(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", assetId));

        String url = storageService.store(file, "assets/documents");
        AssetDocument document = AssetDocument.builder()
                .asset(asset)
                .name(name != null ? name : file.getOriginalFilename())
                .docType(docType)
                .url(url)
                .filename(file.getOriginalFilename())
                .sizeBytes(file.getSize())
                .build();

        document = documentRepository.save(document);
        return AssetResponse.DocumentInfo.builder()
                .id(document.getId())
                .name(document.getName())
                .docType(document.getDocType())
                .url(document.getUrl())
                .filename(document.getFilename())
                .sizeBytes(document.getSizeBytes())
                .build();
    }

    @Transactional
    public void deleteDocument(Long assetId, Long documentId) {
        AssetDocument document = documentRepository.findByIdAndAssetId(documentId, assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId));
        storageService.delete(document.getUrl());
        documentRepository.delete(document);
    }

    @Transactional
    public AssetResponse.QrInfo getOrGenerateQr(Long assetId) {
        Asset asset = assetRepository.findByIdAndDeletedFalse(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", assetId));

        return qrCodeRepository.findByAssetId(assetId)
                .map(qr -> AssetResponse.QrInfo.builder()
                        .qrData(qr.getQrData())
                        .qrImageUrl(qr.getQrImageUrl())
                        .build())
                .orElseGet(() -> {
                    AssetQrCode qr = generateAndSaveQrCode(asset);
                    return AssetResponse.QrInfo.builder()
                            .qrData(qr.getQrData())
                            .qrImageUrl(qr.getQrImageUrl())
                            .build();
                });
    }

    @Transactional
    public AssetResponse.QrInfo regenerateQr(Long assetId) {
        Asset asset = assetRepository.findByIdAndDeletedFalse(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", assetId));
        qrCodeRepository.findByAssetId(assetId).ifPresent(qrCodeRepository::delete);
        AssetQrCode qr = generateAndSaveQrCode(asset);
        return AssetResponse.QrInfo.builder()
                .qrData(qr.getQrData())
                .qrImageUrl(qr.getQrImageUrl())
                .build();
    }

    private AssetQrCode generateAndSaveQrCode(Asset asset) {
        String qrData = "ASSETFLOW|" + asset.getAssetTag() + "|" + asset.getId();
        byte[] qrImage = qrCodeService.generateQrCodeImage(qrData);
        String filename = "qr_" + asset.getAssetTag().replace("/", "_") + ".png";
        String qrImageUrl = storageService.storeQrImage(qrImage, filename);

        AssetQrCode qrCode = AssetQrCode.builder()
                .asset(asset)
                .qrData(qrData)
                .qrImageUrl(qrImageUrl)
                .build();
        return qrCodeRepository.save(qrCode);
    }

    private String generateAssetTag(AssetCategory category) {
        String prefix = category.getCode().substring(0, Math.min(3, category.getCode().length()));
        String uniquePart = String.format("%06d", (int)(Math.random() * 999999) + 1);
        String tag = prefix + "-" + uniquePart;
        while (assetRepository.existsByAssetTagAndDeletedFalse(tag)) {
            uniquePart = String.format("%06d", (int)(Math.random() * 999999) + 1);
            tag = prefix + "-" + uniquePart;
        }
        return tag;
    }

    private AssetResponse toSummaryResponse(Asset asset) {
        AssetImage primaryImage = imageRepository.findByAssetIdOrderByPrimaryDesc(asset.getId()).stream()
                .filter(AssetImage::isPrimary)
                .findFirst()
                .orElse(null);

        return toSummaryResponse(asset, primaryImage);
    }

    private AssetResponse toSummaryResponse(Asset asset, AssetImage primaryImage) {
        String primaryImageUrl = primaryImage != null ? primaryImage.getUrl() : null;

        int warrantyDaysLeft = 0;
        boolean warrantyExpired = false;
        if (asset.getWarrantyExpiry() != null) {
            warrantyDaysLeft = (int) ChronoUnit.DAYS.between(LocalDate.now(), asset.getWarrantyExpiry());
            warrantyExpired = warrantyDaysLeft < 0;
        }

        return AssetResponse.builder()
                .id(asset.getId())
                .assetTag(asset.getAssetTag())
                .name(asset.getName())
                .categoryId(asset.getCategory().getId())
                .categoryName(asset.getCategory().getName())
                .status(asset.getStatus())
                .condition(asset.getCondition())
                .location(asset.getLocation())
                .departmentId(asset.getDepartment() != null ? asset.getDepartment().getId() : null)
                .departmentName(asset.getDepartment() != null ? asset.getDepartment().getName() : null)
                .purchaseDate(asset.getPurchaseDate())
                .purchasePrice(asset.getPurchasePrice())
                .warrantyExpiry(asset.getWarrantyExpiry())
                .warrantyExpired(warrantyExpired)
                .warrantyDaysLeft(Math.max(0, warrantyDaysLeft))
                .primaryImageUrl(primaryImageUrl)
                .createdAt(asset.getCreatedAt())
                .build();
    }

    private AssetResponse toDetailResponse(Asset asset) {
        AssetResponse response = toSummaryResponse(asset);
        response.setDescription(asset.getDescription());
        response.setSerialNumber(asset.getSerialNumber());
        response.setModel(asset.getModel());
        response.setManufacturer(asset.getManufacturer());
        response.setVendor(asset.getVendor());
        response.setCurrentValue(asset.getCurrentValue());
        response.setNotes(asset.getNotes());
        response.setUpdatedAt(asset.getUpdatedAt());

        response.setImages(imageRepository.findByAssetIdOrderByPrimaryDesc(asset.getId())
                .stream().map(img -> AssetResponse.ImageInfo.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .filename(img.getFilename())
                        .primary(img.isPrimary())
                        .build())
                .collect(Collectors.toList()));

        response.setDocuments(documentRepository.findByAssetId(asset.getId())
                .stream().map(doc -> AssetResponse.DocumentInfo.builder()
                        .id(doc.getId())
                        .name(doc.getName())
                        .docType(doc.getDocType())
                        .url(doc.getUrl())
                        .filename(doc.getFilename())
                        .sizeBytes(doc.getSizeBytes())
                        .build())
                .collect(Collectors.toList()));

        qrCodeRepository.findByAssetId(asset.getId()).ifPresent(qr ->
                response.setQrCode(AssetResponse.QrInfo.builder()
                        .qrData(qr.getQrData())
                        .qrImageUrl(qr.getQrImageUrl())
                        .build()));

        return response;
    }
}
