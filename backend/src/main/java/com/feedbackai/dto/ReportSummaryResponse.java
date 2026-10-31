package com.feedbackai.dto;
public record ReportSummaryResponse(long totalFeedback, double averageRating, long positive, long neutral, long negative, long pending) {}
