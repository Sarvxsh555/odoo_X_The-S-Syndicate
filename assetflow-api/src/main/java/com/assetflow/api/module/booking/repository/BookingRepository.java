package com.assetflow.api.module.booking.repository;

import com.assetflow.api.module.booking.entity.Booking;
import com.assetflow.api.module.booking.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT b FROM Booking b
        LEFT JOIN FETCH b.resource r
        WHERE (:resourceId IS NULL OR r.id = :resourceId)
        AND (:status IS NULL OR b.status = :status)
    """)
    Page<Booking> findAllWithFilters(
            @Param("resourceId") Long resourceId,
            @Param("status") BookingStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
        AND b.status NOT IN ('CANCELLED')
        AND b.startDatetime < :end
        AND b.endDatetime > :start
    """)
    List<Booking> findOverlapping(
            @Param("resourceId") Long resourceId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("""
        SELECT b FROM Booking b
        LEFT JOIN FETCH b.resource r
        LEFT JOIN FETCH b.bookedBy u
        WHERE r.id = :resourceId
        AND b.status NOT IN ('CANCELLED')
        AND YEAR(b.startDatetime) = :year AND MONTH(b.startDatetime) = :month
    """)
    List<Booking> findByResourceAndMonth(
            @Param("resourceId") Long resourceId,
            @Param("year") int year,
            @Param("month") int month
    );

    List<Booking> findByStatusAndReminderSentFalseAndStartDatetimeBetween(
            BookingStatus status, Instant start, Instant end);
}
