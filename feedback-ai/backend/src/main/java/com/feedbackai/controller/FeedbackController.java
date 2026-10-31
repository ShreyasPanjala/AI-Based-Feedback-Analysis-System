package com.feedbackai.controller;

import com.feedbackai.dto.FeedbackRequest;
import com.feedbackai.model.Feedback;
import com.feedbackai.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        Feedback createdFeedback = feedbackService.submitFeedback(request);
        return new ResponseEntity<>(createdFeedback, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Feedback>> getFeedbackByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByCategory(categoryId));
    }

    @GetMapping("/sentiment/{sentiment}")
    public ResponseEntity<List<Feedback>> getFeedbackBySentiment(@PathVariable String sentiment) {
        return ResponseEntity.ok(feedbackService.getFeedbackBySentiment(sentiment));
    }

    @PutMapping("/{id}/sentiment")
    public ResponseEntity<Feedback> updateSentiment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String sentiment = body.getOrDefault("sentiment", "PENDING");
        return ResponseEntity.ok(feedbackService.updateSentiment(id, sentiment));
    }

    @PostMapping("/analyze-pending")
    public ResponseEntity<List<Feedback>> analyzePending() {
        return ResponseEntity.ok(feedbackService.analyzePendingFeedbacks());
    }
}
