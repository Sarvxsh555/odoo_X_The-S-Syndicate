package com.assetflow.api.module.report.controller;

import com.assetflow.api.module.report.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.function.Function;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Exportable Excel/PDF reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/assets")
    public ResponseEntity<byte[]> assets(@RequestParam(defaultValue = "xlsx") String format) {
        return download("assets", format, reportService::assetsReport);
    }

    @GetMapping("/allocations")
    public ResponseEntity<byte[]> allocations(@RequestParam(defaultValue = "xlsx") String format) {
        return download("allocations", format, reportService::allocationsReport);
    }

    @GetMapping("/maintenance")
    public ResponseEntity<byte[]> maintenance(@RequestParam(defaultValue = "xlsx") String format) {
        return download("maintenance", format, reportService::maintenanceReport);
    }

    @GetMapping("/bookings")
    public ResponseEntity<byte[]> bookings(@RequestParam(defaultValue = "xlsx") String format) {
        return download("bookings", format, reportService::bookingsReport);
    }

    @GetMapping("/warranty")
    public ResponseEntity<byte[]> warranty(@RequestParam(defaultValue = "xlsx") String format) {
        return download("warranty", format, reportService::warrantyReport);
    }

    private ResponseEntity<byte[]> download(String reportName, String format, Function<String, byte[]> generator) {
        String normalized = format == null ? "xlsx" : format.toLowerCase();
        byte[] content = generator.apply(normalized);

        MediaType mediaType = normalized.equals("pdf")
                ? MediaType.APPLICATION_PDF
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        String filename = reportName + "-report." + normalized;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(content);
    }
}
