package com.assetflow.api.module.booking.controller;

import com.assetflow.api.common.dto.ApiResponse;
import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.module.auth.security.UserPrincipal;
import com.assetflow.api.module.booking.dto.*;
import com.assetflow.api.module.booking.entity.*;
import com.assetflow.api.module.booking.service.BookingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Resource booking and calendar management")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings(resourceId, status, page, size)));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getById(id)));
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created", bookingService.createBooking(request, principal.getId())));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", bookingService.cancelBooking(id, principal.getId(), reason)));
    }

    @PutMapping("/bookings/{id}/reschedule")
    public ResponseEntity<ApiResponse<BookingResponse>> rescheduleBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Booking rescheduled", bookingService.rescheduleBooking(id, request, principal.getId())));
    }

    @GetMapping("/bookings/calendar")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCalendar(
            @RequestParam Long resourceId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getCalendarBookings(resourceId, year, month)));
    }

    @GetMapping("/bookable-resources")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getResources(
            @RequestParam(required = false) ResourceType type) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllResources(type)));
    }

    @PostMapping("/bookable-resources")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(
            @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created", bookingService.createResource(request)));
    }
}
