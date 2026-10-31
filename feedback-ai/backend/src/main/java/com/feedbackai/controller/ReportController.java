package com.feedbackai.controller;
import com.feedbackai.dto.*;
import com.feedbackai.service.ReportService;
import java.util.List;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/reports")
public class ReportController {
    private final ReportService service;
    public ReportController(ReportService service) { this.service = service; }
    @GetMapping("/summary") public ReportSummaryResponse summary() { return service.summary(); }
    @GetMapping("/category") public List<CategoryReportResponse> byCategory() { return service.byCategory(); }
}
