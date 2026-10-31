package com.feedbackai.service;

import com.feedbackai.dto.FeedbackRequest;
import com.feedbackai.exception.ResourceNotFoundException;
import com.feedbackai.model.Category;
import com.feedbackai.model.Feedback;
import com.feedbackai.model.User;
import com.feedbackai.repository.CategoryRepository;
import com.feedbackai.repository.FeedbackRepository;
import com.feedbackai.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final HttpClient httpClient;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build();
    }

    @Transactional
    public Feedback submitFeedback(FeedbackRequest request) {
        // 1. Validate rating between 1 and 5
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be an integer between 1 and 5");
        }

        // 2. Validate message is not blank
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Feedback message must not be blank");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        // 3. Initially set sentiment to "PENDING"
        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setCategory(category);
        feedback.setMessage(request.getMessage().trim());
        feedback.setRating(request.getRating());
        feedback.setSentiment("PENDING");
        feedback.setCreatedAt(LocalDateTime.now());

        // 4. Save feedback
        return feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Feedback> getFeedbackByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        return feedbackRepository.findByCategoryId(categoryId);
    }

    @Transactional(readOnly = true)
    public List<Feedback> getFeedbackBySentiment(String sentiment) {
        return feedbackRepository.findBySentimentIgnoreCase(sentiment.trim());
    }

    @Transactional
    public Feedback updateSentiment(Long id, String sentiment) {
        Feedback feedback = getFeedbackById(id);
        String cleaned = sentiment != null ? sentiment.trim().toUpperCase() : "PENDING";
        feedback.setSentiment(cleaned);
        return feedbackRepository.save(feedback);
    }

    @Transactional
    public List<Feedback> analyzePendingFeedbacks() {
        List<Feedback> pending = feedbackRepository.findBySentimentIgnoreCase("PENDING");
        for (Feedback fb : pending) {
            String classified = classifyTextSentiment(fb.getMessage(), fb.getRating());
            fb.setSentiment(classified);
            feedbackRepository.save(fb);
        }
        return pending;
    }

    public String classifyTextSentiment(String message, Integer rating) {
        // Attempt to call Python NLP Sentiment Service if active
        try {
            String jsonPayload = String.format("{\"text\":\"%s\",\"rating\":%d}",
                    escapeJson(message), rating != null ? rating : 3);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:5000/analyze"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(2))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200 && response.body() != null) {
                String body = response.body().toUpperCase();
                if (body.contains("\"POSITIVE\"")) return "POSITIVE";
                if (body.contains("\"NEGATIVE\"")) return "NEGATIVE";
                if (body.contains("\"NEUTRAL\"")) return "NEUTRAL";
            }
        } catch (Exception ignored) {
            // Fallback to intelligent sentiment heuristic
        }

        // Rule-based NLP classifier fallback
        int r = rating != null ? rating : 3;
        if (r >= 4) return "POSITIVE";
        if (r <= 2) return "NEGATIVE";

        String lower = message != null ? message.toLowerCase() : "";
        if (lower.contains("great") || lower.contains("good") || lower.contains("excellent") ||
                lower.contains("love") || lower.contains("helpful") || lower.contains("satisfied") ||
                lower.contains("fast") || lower.contains("recommend")) {
            return "POSITIVE";
        }
        if (lower.contains("bad") || lower.contains("poor") || lower.contains("terrible") ||
                lower.contains("worst") || lower.contains("broken") || lower.contains("drop") ||
                lower.contains("delay") || lower.contains("issue") || lower.contains("problem") ||
                lower.contains("slow") || lower.contains("hate")) {
            return "NEGATIVE";
        }

        return "NEUTRAL";
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", " ")
                .replace("\r", " ");
    }
}
