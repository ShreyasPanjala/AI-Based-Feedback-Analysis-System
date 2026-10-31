package com.feedbackai.service;

import com.feedbackai.dto.FeedbackRequest;
import com.feedbackai.dto.FeedbackResponse;
import com.feedbackai.entity.Feedback;
import com.feedbackai.exception.ResourceNotFoundException;
import com.feedbackai.repository.*;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {
    private final FeedbackRepository feedback;
    private final UserRepository users;
    private final CategoryRepository categories;
    private final SentimentService sentimentService;
    public FeedbackService(FeedbackRepository feedback, UserRepository users, CategoryRepository categories, SentimentService sentimentService) {
        this.feedback = feedback; this.users = users; this.categories = categories; this.sentimentService = sentimentService;
    }
    @Transactional
    public FeedbackResponse create(FeedbackRequest request) {
        Feedback item = new Feedback();
        item.setUser(users.findById(request.userId()).orElseThrow(() -> new ResourceNotFoundException("User " + request.userId() + " not found")));
        item.setCategory(categories.findById(request.categoryId()).orElseThrow(() -> new ResourceNotFoundException("Category " + request.categoryId() + " not found")));
        item.setMessage(request.message()); item.setRating(request.rating());
        item.setSentiment(sentimentService.analyze(request.message()));
        return FeedbackResponse.from(feedback.saveAndFlush(item));
    }
    @Transactional(readOnly = true)
    public List<FeedbackResponse> all() { return feedback.findAll().stream().map(FeedbackResponse::from).toList(); }
    @Transactional(readOnly = true)
    public FeedbackResponse one(Long id) { return FeedbackResponse.from(feedback.findById(id).orElseThrow(() -> new ResourceNotFoundException("Feedback " + id + " not found"))); }
    @Transactional(readOnly = true)
    public List<FeedbackResponse> byCategory(Long id) {
        if (!categories.existsById(id)) throw new ResourceNotFoundException("Category " + id + " not found");
        return feedback.findByCategoryId(id).stream().map(FeedbackResponse::from).toList();
    }
    @Transactional(readOnly = true)
    public List<FeedbackResponse> bySentiment(String sentiment) { return feedback.findBySentimentIgnoreCase(sentiment).stream().map(FeedbackResponse::from).toList(); }
}
