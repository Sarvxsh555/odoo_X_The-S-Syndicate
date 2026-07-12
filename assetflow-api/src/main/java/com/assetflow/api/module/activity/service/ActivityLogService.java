package com.assetflow.api.module.activity.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.module.activity.dto.ActivityLogResponse;
import com.assetflow.api.module.activity.entity.ActivityLog;
import com.assetflow.api.module.activity.repository.ActivityLogRepository;
import com.assetflow.api.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<ActivityLogResponse> getAll(Long userId, String entityType, int page, int size) {
        var pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PageResponse.of(activityLogRepository.findAllWithFilters(userId, entityType, pageRequest)
                .map(this::toResponse));
    }

    @Transactional
    public void log(Long userId, String action, String entityType, Long entityId, String description, String oldValue, String newValue, String ipAddress, String userAgent) {
        var user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();
        activityLogRepository.save(log);
    }

    private ActivityLogResponse toResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : "SYSTEM")
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .description(log.getDescription())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
