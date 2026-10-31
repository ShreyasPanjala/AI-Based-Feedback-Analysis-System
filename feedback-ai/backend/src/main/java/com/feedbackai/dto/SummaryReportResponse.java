package com.feedbackai.dto;

public class SummaryReportResponse {

    private long totalFeedback;
    private double averageRating;
    private long positive;
    private long neutral;
    private long negative;

    public SummaryReportResponse() {
    }

    public SummaryReportResponse(long totalFeedback, double averageRating, long positive, long neutral, long negative) {
        this.totalFeedback = totalFeedback;
        this.averageRating = Math.round(averageRating * 10.0) / 10.0;
        this.positive = positive;
        this.neutral = neutral;
        this.negative = negative;
    }

    public long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = Math.round(averageRating * 10.0) / 10.0;
    }

    public long getPositive() {
        return positive;
    }

    public void setPositive(long positive) {
        this.positive = positive;
    }

    public long getNeutral() {
        return neutral;
    }

    public void setNeutral(long neutral) {
        this.neutral = neutral;
    }

    public long getNegative() {
        return negative;
    }

    public void setNegative(long negative) {
        this.negative = negative;
    }
}

