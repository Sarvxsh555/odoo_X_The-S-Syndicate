package com.assetflow.api.module.report.service;

import com.assetflow.api.common.exception.BusinessException;
import com.assetflow.api.module.allocation.entity.Allocation;
import com.assetflow.api.module.allocation.repository.AllocationRepository;
import com.assetflow.api.module.asset.entity.Asset;
import com.assetflow.api.module.asset.repository.AssetRepository;
import com.assetflow.api.module.auth.entity.User;
import com.assetflow.api.module.booking.entity.Booking;
import com.assetflow.api.module.booking.repository.BookingRepository;
import com.assetflow.api.module.maintenance.entity.MaintenanceRequest;
import com.assetflow.api.module.maintenance.repository.MaintenanceRepository;
import com.assetflow.api.module.report.util.ReportFileGenerator;
import com.assetflow.api.module.user.entity.EmployeeProfile;
import com.assetflow.api.module.user.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final List<String> SUPPORTED_FORMATS = List.of("xlsx", "pdf");

    private final AssetRepository assetRepository;
    private final AllocationRepository allocationRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final BookingRepository bookingRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final ReportFileGenerator reportFileGenerator;

    public byte[] assetsReport(String format) {
        List<String> headers = List.of("Asset Tag", "Name", "Category", "Status", "Condition",
                "Department", "Location", "Serial Number", "Purchase Date", "Purchase Price",
                "Current Value", "Warranty Expiry");

        List<List<String>> rows = new ArrayList<>();
        for (Asset a : assetRepository.findAllForReport()) {
            rows.add(List.of(
                    nvl(a.getAssetTag()),
                    nvl(a.getName()),
                    a.getCategory() != null ? a.getCategory().getName() : "",
                    a.getStatus().name(),
                    a.getCondition().name(),
                    a.getDepartment() != null ? a.getDepartment().getName() : "",
                    nvl(a.getLocation()),
                    nvl(a.getSerialNumber()),
                    formatDate(a.getPurchaseDate()),
                    formatMoney(a.getPurchasePrice()),
                    formatMoney(a.getCurrentValue()),
                    formatDate(a.getWarrantyExpiry())
            ));
        }
        return render(format, "Asset Inventory", headers, rows);
    }

    public byte[] allocationsReport(String format) {
        List<String> headers = List.of("Asset Tag", "Asset Name", "Allocated To", "Department",
                "Status", "Allocation Date", "Expected Return", "Actual Return", "Condition at Allocation",
                "Condition at Return");

        List<List<String>> rows = new ArrayList<>();
        for (Allocation a : allocationRepository.findAllForReport()) {
            rows.add(List.of(
                    a.getAsset() != null ? nvl(a.getAsset().getAssetTag()) : "",
                    a.getAsset() != null ? nvl(a.getAsset().getName()) : "",
                    displayName(a.getAllocatedTo()),
                    a.getDepartment() != null ? a.getDepartment().getName() : "",
                    a.getStatus().name(),
                    formatDateTime(a.getAllocationDate()),
                    formatDate(a.getExpectedReturnDate()),
                    formatDateTime(a.getActualReturnDate()),
                    a.getConditionAtAllocation() != null ? a.getConditionAtAllocation().name() : "",
                    a.getConditionAtReturn() != null ? a.getConditionAtReturn().name() : ""
            ));
        }
        return render(format, "Allocation Report", headers, rows);
    }

    public byte[] maintenanceReport(String format) {
        List<String> headers = List.of("Asset Tag", "Title", "Priority", "Status", "Requested By",
                "Assigned Technician", "Scheduled Date", "Estimated Cost", "Actual Cost");

        List<List<String>> rows = new ArrayList<>();
        for (MaintenanceRequest m : maintenanceRepository.findAllForReport()) {
            rows.add(List.of(
                    m.getAsset() != null ? nvl(m.getAsset().getAssetTag()) : "",
                    nvl(m.getTitle()),
                    m.getPriority().name(),
                    m.getStatus().name(),
                    displayName(m.getRequestedBy()),
                    m.getAssignedTechnician() != null ? displayName(m.getAssignedTechnician()) : "",
                    formatDate(m.getScheduledDate()),
                    formatMoney(m.getEstimatedCost()),
                    formatMoney(m.getActualCost())
            ));
        }
        return render(format, "Maintenance Report", headers, rows);
    }

    public byte[] bookingsReport(String format) {
        List<String> headers = List.of("Resource", "Type", "Title", "Booked By", "Start", "End", "Status");

        List<List<String>> rows = new ArrayList<>();
        for (Booking b : bookingRepository.findAllForReport()) {
            rows.add(List.of(
                    b.getResource() != null ? nvl(b.getResource().getName()) : "",
                    b.getResource() != null ? b.getResource().getType().name() : "",
                    nvl(b.getTitle()),
                    displayName(b.getBookedBy()),
                    formatDateTime(b.getStartDatetime()),
                    formatDateTime(b.getEndDatetime()),
                    b.getStatus().name()
            ));
        }
        return render(format, "Booking Report", headers, rows);
    }

    public byte[] warrantyReport(String format) {
        List<String> headers = List.of("Asset Tag", "Name", "Category", "Manufacturer",
                "Purchase Date", "Warranty Expiry", "Status");

        LocalDate today = LocalDate.now();
        List<List<String>> rows = new ArrayList<>();
        for (Asset a : assetRepository.findWarrantyReport()) {
            String warrantyStatus = a.getWarrantyExpiry().isBefore(today) ? "Expired"
                    : a.getWarrantyExpiry().isBefore(today.plusDays(30)) ? "Expiring Soon"
                    : "Valid";
            rows.add(List.of(
                    nvl(a.getAssetTag()),
                    nvl(a.getName()),
                    a.getCategory() != null ? a.getCategory().getName() : "",
                    nvl(a.getManufacturer()),
                    formatDate(a.getPurchaseDate()),
                    formatDate(a.getWarrantyExpiry()),
                    warrantyStatus
            ));
        }
        return render(format, "Warranty Report", headers, rows);
    }

    private byte[] render(String format, String title, List<String> headers, List<List<String>> rows) {
        String normalized = format == null ? "" : format.toLowerCase();
        if (!SUPPORTED_FORMATS.contains(normalized)) {
            throw new BusinessException("Unsupported report format: " + format + ". Use 'xlsx' or 'pdf'.");
        }
        return normalized.equals("pdf")
                ? reportFileGenerator.toPdf(title, headers, rows)
                : reportFileGenerator.toExcel(title, headers, rows);
    }

    private String displayName(User user) {
        if (user == null) return "";
        return employeeProfileRepository.findByUserIdAndDeletedFalse(user.getId())
                .map(EmployeeProfile::getFullName)
                .orElse(user.getEmail());
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FMT) : "";
    }

    private String formatDateTime(Instant instant) {
        if (instant == null) return "";
        return DATE_FMT.withZone(ZoneOffset.UTC).format(instant);
    }

    private String formatMoney(BigDecimal amount) {
        return amount != null ? amount.toPlainString() : "";
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }
}
