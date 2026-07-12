package com.assetflow.api.module.approval.service;

import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.approval.dto.ApprovalCreateRequest;
import com.assetflow.api.module.approval.dto.ApprovalDecisionRequest;
import com.assetflow.api.module.approval.entity.ApprovalRequest;
import com.assetflow.api.module.approval.entity.ApprovalStatus;
import com.assetflow.api.module.approval.entity.ApprovalType;
import com.assetflow.api.module.approval.repository.ApprovalRequestRepository;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.notification.service.NotificationService;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApprovalServiceTest {

    @Mock private ApprovalRequestRepository approvalRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmployeeProfileRepository employeeProfileRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private ApprovalService approvalService;

    private User requester;
    private User admin;

    @BeforeEach
    void setUp() {
        requester = User.builder().id(10L).email("requester@assetflow.com").build();
        admin = User.builder().id(1L).email("admin@assetflow.com").build();

        lenient().when(employeeProfileRepository.findByUserIdAndDeletedFalse(any())).thenReturn(Optional.empty());
        lenient().when(approvalRepository.save(any(ApprovalRequest.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void create_success_savesPendingRequestAndNotifiesRequester() {
        ApprovalCreateRequest request = new ApprovalCreateRequest();
        request.setType(ApprovalType.ASSET_DISPOSAL);
        request.setEntityId(1L);
        request.setEntityType("ASSET");
        request.setTitle("Dispose broken laptop");

        when(userRepository.findById(10L)).thenReturn(Optional.of(requester));

        var response = approvalService.create(request, 10L);

        assertThat(response.getStatus()).isEqualTo(ApprovalStatus.PENDING);
        assertThat(response.getType()).isEqualTo(ApprovalType.ASSET_DISPOSAL);
        assertThat(response.getRequestedByUserId()).isEqualTo(10L);
        verify(notificationService).createNotification(eq(10L), anyString(), anyString(), eq("APPROVAL_REQUIRED"), eq("approval"), any());
    }

    @Test
    void makeDecision_approves_setsApproverAndResolvedTimestamp() {
        ApprovalRequest approval = ApprovalRequest.builder()
                .id(5L)
                .type(ApprovalType.MAINTENANCE_REQUEST)
                .entityId(1L)
                .entityType("MAINTENANCE_REQUEST")
                .requestedBy(requester)
                .status(ApprovalStatus.PENDING)
                .title("Fix printer")
                .build();

        ApprovalDecisionRequest decision = new ApprovalDecisionRequest();
        decision.setStatus(ApprovalStatus.APPROVED);
        decision.setResolutionNotes("Looks good");

        when(approvalRepository.findById(5L)).thenReturn(Optional.of(approval));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        var response = approvalService.makeDecision(5L, decision, 1L);

        assertThat(response.getStatus()).isEqualTo(ApprovalStatus.APPROVED);
        assertThat(response.getApprovedByUserId()).isEqualTo(1L);
        assertThat(approval.getResolvedAt()).isNotNull();
        verify(notificationService).createNotification(eq(10L), anyString(), anyString(), eq("APPROVAL_RESOLVED"), eq("approval"), eq(5L));
    }

    @Test
    void makeDecision_throwsWhenAlreadyResolved() {
        ApprovalRequest approval = ApprovalRequest.builder()
                .id(5L)
                .type(ApprovalType.MAINTENANCE_REQUEST)
                .entityId(1L)
                .entityType("MAINTENANCE_REQUEST")
                .requestedBy(requester)
                .status(ApprovalStatus.REJECTED)
                .title("Fix printer")
                .build();

        ApprovalDecisionRequest decision = new ApprovalDecisionRequest();
        decision.setStatus(ApprovalStatus.APPROVED);

        when(approvalRepository.findById(5L)).thenReturn(Optional.of(approval));

        assertThatThrownBy(() -> approvalService.makeDecision(5L, decision, 1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already resolved");

        verifyNoInteractions(notificationService);
    }

    @Test
    void makeDecision_throwsWhenApprovalNotFound() {
        ApprovalDecisionRequest decision = new ApprovalDecisionRequest();
        decision.setStatus(ApprovalStatus.APPROVED);

        when(approvalRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> approvalService.makeDecision(999L, decision, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
