package com.feedbackai.service;

import com.feedbackai.dto.*;
import com.feedbackai.entity.Feedback;
import com.feedbackai.repository.FeedbackRepository;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {
    private final FeedbackRepository feedback;
    public ReportService(FeedbackRepository feedback) { this.feedback = feedback; }
    @Transactional(readOnly = true)
    public ReportSummaryResponse summary() {
        List<Feedback> items = feedback.findAll();
        double average = items.stream().mapToInt(Feedback::getRating).average().orElse(0);
        Map<String, Long> counts = items.stream().collect(Collectors.groupingBy(f -> f.getSentiment().toUpperCase(Locale.ROOT), Collectors.counting()));
        return new ReportSummaryResponse(items.size(), average, counts.getOrDefault("POSITIVE", 0L), counts.getOrDefault("NEUTRAL", 0L), counts.getOrDefault("NEGATIVE", 0L), counts.getOrDefault("PENDING", 0L));
    }
    @Transactional(readOnly = true)
    public List<CategoryReportResponse> byCategory() {
        return feedback.findAll().stream().collect(Collectors.groupingBy(f -> f.getCategory().getName(), TreeMap::new, Collectors.toList()))
            .entrySet().stream().map(e -> new CategoryReportResponse(e.getKey(), e.getValue().size(), e.getValue().stream().mapToInt(Feedback::getRating).average().orElse(0))).toList();
    }
}
