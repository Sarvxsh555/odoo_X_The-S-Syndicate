package com.assetflow.api.module.auth.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.common.exception.InvalidTokenException;
import com.assetflow.api.module.auth.dto.*;
import com.assetflow.api.module.auth.security.UserPrincipal;
import com.assetflow.api.module.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.assetflow.api.module.auth.entity.LoginHistory;
import com.assetflow.api.module.auth.repository.LoginHistoryRepository;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, signup, and token management")
public class AuthController {

    private final AuthService authService;
    private final LoginHistoryRepository loginHistoryRepository;

    @PostMapping("/signup")
    @Operation(summary = "Register a new employee account")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate and receive JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        String userAgent = httpRequest.getHeader("User-Agent");
        AuthResponse response = authService.login(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token using a valid refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestParam(required = false) String token,
            @RequestBody(required = false) RefreshTokenRequest request) {
        String refreshToken = request != null ? request.getToken() : token;
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidTokenException("Refresh token is required");
        }
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke all refresh tokens for the current user")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal UserPrincipal principal) {
        authService.logout(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("If an account exists, a reset email has been sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using the token from email")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. Please log in."));
    }
    @GetMapping("/login-history")
    @Operation(summary = "Get login history for the current user")
    public ResponseEntity<ApiResponse<Page<LoginHistory>>> getLoginHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LoginHistory> history = loginHistoryRepository.findByUserIdOrderByCreatedAtDesc(
                principal.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
