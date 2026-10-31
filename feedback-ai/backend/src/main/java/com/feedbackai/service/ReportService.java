package com.feedbackai.service;

import com.feedbackai.dto.CategoryReportResponse;
import com.feedbackai.dto.SummaryReportResponse;
import com.feedbackai.model.Category;
import com.feedbackai.model.Feedback;
import com.feedbackai.repository.CategoryRepository;
import com.feedbackai.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private final FeedbackRepository feedbackRepository;
    private final CategoryRepository categoryRepository;

    public ReportService(FeedbackRepository feedbackRepository, CategoryRepository categoryRepository) {
        this.feedbackRepository = feedbackRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public SummaryReportResponse getSummary() {
        long totalFeedback = feedbackRepository.count();
        Double avgRating = feedbackRepository.getAverageRating();
        double averageRating = (avgRating != null) ? avgRating : 0.0;
        long positive = feedbackRepository.countBySentimentIgnoreCase("POSITIVE");
        long neutral = feedbackRepository.countBySentimentIgnoreCase("NEUTRAL");
        long negative = feedbackRepository.countBySentimentIgnoreCase("NEGATIVE");

        return new SummaryReportResponse(totalFeedback, averageRating, positive, neutral, negative);
    }

    @Transactional(readOnly = true)
    public List<CategoryReportResponse> getCategoryReport() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryReportResponse> reportList = new ArrayList<>();

        for (Category category : categories) {
            long totalFeedback = feedbackRepository.countByCategoryId(category.getId());
            Double avgRating = feedbackRepository.getAverageRatingByCategoryId(category.getId());
            double averageRating = (avgRating != null) ? avgRating : 0.0;
            long positive = feedbackRepository.countByCategoryIdAndSentimentIgnoreCase(category.getId(), "POSITIVE");
            long neutral = feedbackRepository.countByCategoryIdAndSentimentIgnoreCase(category.getId(), "NEUTRAL");
            long negative = feedbackRepository.countByCategoryIdAndSentimentIgnoreCase(category.getId(), "NEGATIVE");

            reportList.add(new CategoryReportResponse(
                    category.getId(),
                    category.getName(),
                    totalFeedback,
                    averageRating,
                    positive,
                    neutral,
                    negative
            ));
        }

        return reportList;
    }
}

