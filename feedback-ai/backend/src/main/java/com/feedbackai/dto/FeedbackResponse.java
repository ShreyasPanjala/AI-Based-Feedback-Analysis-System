package com.feedbackai.dto;
import com.feedbackai.entity.Feedback;
import java.time.Instant;
public record FeedbackResponse(Long id, Long userId, Long categoryId, String message, Integer rating, String sentiment, Instant createdAt) {
    public static FeedbackResponse from(Feedback f) { return new FeedbackResponse(f.getId(), f.getUser().getId(), f.getCategory().getId(), f.getMessage(), f.getRating(), f.getSentiment(), f.getCreatedAt()); }
}
