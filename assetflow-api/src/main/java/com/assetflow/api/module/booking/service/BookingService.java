package com.assetflow.api.module.booking.service;

import com.assetflow.api.common.dto.PageResponse;
import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.common.exception.ResourceNotFoundException;
import com.assetflow.api.module.auth.repository.UserRepository;
import com.assetflow.api.module.booking.dto.*;
import com.assetflow.api.module.booking.entity.*;
import com.assetflow.api.module.booking.repository.*;
import com.assetflow.api.module.notification.service.NotificationService;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookableResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getAllBookings(Long resourceId, BookingStatus status, int page, int size) {
        var pageRequest = PageRequest.of(page, size, Sort.by("startDatetime").descending());
        return PageResponse.of(bookingRepository.findAllWithFilters(resourceId, status, pageRequest)
                .map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public BookingResponse getById(Long id) {
        return toResponse(bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id)));
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long userId) {
        BookableResource resource = resourceRepository.findByIdAndDeletedFalse(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", request.getResourceId()));

        if (!resource.isActive()) {
            throw new BusinessException("This resource is not available for booking");
        }

        // Overlap validation
        List<Booking> overlapping = bookingRepository.findOverlapping(
                request.getResourceId(), request.getStartDatetime(), request.getEndDatetime());
        if (!overlapping.isEmpty()) {
            throw new BusinessException("Booking conflicts with an existing reservation for this resource. Please choose a different time slot.");
        }

        if (!request.getEndDatetime().isAfter(request.getStartDatetime())) {
            throw new BusinessException("End time must be after start time");
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Booking booking = Booking.builder()
                .resource(resource)
                .bookedBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .notes(request.getNotes())
                .build();

        booking = bookingRepository.save(booking);

        notificationService.createNotification(
                userId,
                "Booking Confirmed",
                "Your booking for '" + resource.getName() + "' has been confirmed.",
                "BOOKING_CONFIRMED", "booking", booking.getId()
        );

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, Long userId, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException("Cannot cancel a completed booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledReason(reason);
        booking = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getBookedBy().getId(),
                "Booking Cancelled",
                "Your booking for '" + booking.getResource().getName() + "' has been cancelled.",
                "BOOKING_CANCELLED", "booking", id
        );

        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getCalendarBookings(Long resourceId, int year, int month) {
        return bookingRepository.findByResourceAndMonth(resourceId, year, month)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getAllResources(ResourceType type) {
        List<BookableResource> resources = type != null
                ? resourceRepository.findByTypeAndDeletedFalseAndActiveTrue(type)
                : resourceRepository.findByDeletedFalseAndActiveTrue();
        return resources.stream().map(this::toResourceResponse).collect(Collectors.toList());
    }

    @Transactional
    public ResourceResponse createResource(ResourceRequest request) {
        BookableResource resource = BookableResource.builder()
                .name(request.getName())
                .type(request.getType())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .build();
        return toResourceResponse(resourceRepository.save(resource));
    }

    // Scheduled: send reminders 1 hour before booking
    @Scheduled(fixedDelay = 900000) // every 15 mins
    @Transactional
    public void sendBookingReminders() {
        Instant now = Instant.now();
        Instant oneHourLater = now.plus(1, ChronoUnit.HOURS);
        List<Booking> upcoming = bookingRepository
                .findByStatusAndReminderSentFalseAndStartDatetimeBetween(BookingStatus.UPCOMING, now, oneHourLater);
        upcoming.forEach(booking -> {
            notificationService.createNotification(
                    booking.getBookedBy().getId(),
                    "Booking Reminder",
                    "Your booking for '" + booking.getResource().getName() + "' starts in about 1 hour.",
                    "BOOKING_REMINDER", "booking", booking.getId()
            );
            booking.setReminderSent(true);
            bookingRepository.save(booking);
        });
    }

    private BookingResponse toResponse(Booking b) {
        var ep = employeeProfileRepository.findByUserIdAndDeletedFalse(b.getBookedBy().getId()).orElse(null);
        return BookingResponse.builder()
                .id(b.getId())
                .resourceId(b.getResource().getId())
                .resourceName(b.getResource().getName())
                .resourceType(b.getResource().getType().toString())
                .bookedByUserId(b.getBookedBy().getId())
                .bookedByName(ep != null ? ep.getFullName() : b.getBookedBy().getEmail())
                .title(b.getTitle())
                .description(b.getDescription())
                .startDatetime(b.getStartDatetime())
                .endDatetime(b.getEndDatetime())
                .status(b.getStatus())
                .notes(b.getNotes())
                .cancelledReason(b.getCancelledReason())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private ResourceResponse toResourceResponse(BookableResource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType().toString())
                .location(r.getLocation())
                .capacity(r.getCapacity())
                .description(r.getDescription())
                .active(r.isActive())
                .build();
    }
}
