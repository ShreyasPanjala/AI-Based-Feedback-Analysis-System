package com.feedbackai.controller;

import com.feedbackai.dto.CategoryReportResponse;
import com.feedbackai.dto.SummaryReportResponse;
import com.feedbackai.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryReportResponse> getSummary() {
        return ResponseEntity.ok(reportService.getSummary());
    }

    @GetMapping("/category")
    public ResponseEntity<List<CategoryReportResponse>> getCategoryReport() {
        return ResponseEntity.ok(reportService.getCategoryReport());
    }
}

