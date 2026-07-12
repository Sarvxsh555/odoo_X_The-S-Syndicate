package com.assetflow.api.module.auth.service;

import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.DuplicateResourceException;
import com.assetflow.api.common.exception.InvalidTokenException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.config.JwtProperties;
import com.assetflow.api.module.auth.dto.*;
import com.assetflow.api.module.auth.entity.*;
import com.assetflow.api.module.auth.repository.*;
import com.assetflow.api.module.auth.security.JwtService;
import com.assetflow.api.module.auth.security.UserPrincipal;
import com.assetflow.api.module.user.entity.EmployeeProfile;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtProperties jwtProperties;
    private final EmailService emailService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ROLE_EMPLOYEE)
                .active(true)
                .emailVerified(false)
                .build();
        user = userRepository.save(user);

        // Auto-generate employee code
        String empCode = "EMP-" + String.format("%04d", user.getId());

        EmployeeProfile profile = EmployeeProfile.builder()
                .user(user)
                .empCode(empCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();
        employeeProfileRepository.save(profile);

        return buildAuthResponse(user, profile);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmailAndDeletedFalse(principal.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", principal.getEmail()));

        userRepository.updateLastLogin(user.getId(), Instant.now());

        EmployeeProfile profile = employeeProfileRepository.findByUserIdAndDeletedFalse(user.getId())
                .orElse(null);

        return buildAuthResponse(user, profile);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenStr)
                .orElseThrow(() -> new InvalidTokenException("Refresh token is invalid or has been revoked"));

        if (refreshToken.isExpired()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new InvalidTokenException("Refresh token has expired. Please log in again.");
        }

        User user = refreshToken.getUser();
        UserPrincipal principal = UserPrincipal.create(user);

        // Rotate refresh token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        EmployeeProfile profile = employeeProfileRepository.findByUserIdAndDeletedFalse(user.getId())
                .orElse(null);

        return buildAuthResponse(user, profile);
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailAndDeletedFalse(request.getEmail()).ifPresent(user -> {
            // Invalidate existing tokens
            passwordResetTokenRepository.invalidateAllUserTokens(user.getId());

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(Instant.now().plusSeconds(3600)) // 1 hour
                    .build();
            passwordResetTokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), token);
            log.info("Password reset token created for user: {}", user.getEmail());
        });
        // Always return success to prevent user enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Password reset token is invalid or has already been used"));

        if (resetToken.isExpired()) {
            throw new InvalidTokenException("Password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Revoke all refresh tokens for security
        refreshTokenRepository.revokeAllUserTokens(user);
        log.info("Password reset successful for user: {}", user.getEmail());
    }

    private AuthResponse buildAuthResponse(User user, EmployeeProfile profile) {
        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshTokenStr = jwtService.generateRefreshToken(principal);

        // Persist refresh token
        refreshTokenRepository.revokeAllUserTokens(user);
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpiration()))
                .build();
        refreshTokenRepository.save(refreshToken);

        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(profile != null ? profile.getFirstName() : "")
                .lastName(profile != null ? profile.getLastName() : "")
                .role(user.getRole())
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .deptHead(profile != null && profile.isDeptHead())
                .departmentId(profile != null && profile.getDepartment() != null ? profile.getDepartment().getId() : null)
                .departmentName(profile != null && profile.getDepartment() != null ? profile.getDepartment().getName() : null)
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getAccessTokenExpiration() / 1000)
                .user(userInfo)
                .build();
    }
}
