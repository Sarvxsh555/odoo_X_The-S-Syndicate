package com.assetflow.api.module.notification.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.notification.dto.NotificationResponse;
import com.assetflow.api.module.notification.entity.Notification;
import com.assetflow.api.module.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(Long userId, String title, String message, String type, String entityType, Long entityId) {
        userRepository.findById(userId).ifPresent(user -> {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .entityType(entityType)
                    .entityId(entityId)
                    .build();
            notificationRepository.save(notification);
        });
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(Long userId, boolean unreadOnly, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = unreadOnly
                ? notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId, pageRequest)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest);
        return PageResponse.of(notifications.map(this::toResponse));
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        notification.setRead(true);
        notification.setReadAt(Instant.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .entityType(n.getEntityType())
                .entityId(n.getEntityId())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
