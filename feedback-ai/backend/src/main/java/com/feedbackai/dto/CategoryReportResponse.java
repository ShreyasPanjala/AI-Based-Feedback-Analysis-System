package com.feedbackai.dto;

public class CategoryReportResponse {

    private Long categoryId;
    private String categoryName;
    private long totalFeedback;
    private double averageRating;
    private long positive;
    private long neutral;
    private long negative;

    public CategoryReportResponse() {
    }

    public CategoryReportResponse(Long categoryId, String categoryName, long totalFeedback, double averageRating, long positive, long neutral, long negative) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalFeedback = totalFeedback;
        this.averageRating = Math.round(averageRating * 10.0) / 10.0;
        this.positive = positive;
        this.neutral = neutral;
        this.negative = negative;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
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

