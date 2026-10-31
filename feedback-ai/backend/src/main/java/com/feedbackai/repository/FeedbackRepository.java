package com.feedbackai.repository;

import com.feedbackai.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByCategoryId(Long categoryId);

    List<Feedback> findBySentimentIgnoreCase(String sentiment);

    long countBySentimentIgnoreCase(String sentiment);

    @Query("SELECT COALESCE(AVG(f.rating), 0.0) FROM Feedback f")
    Double getAverageRating();

    long countByCategoryId(Long categoryId);

    long countByCategoryIdAndSentimentIgnoreCase(Long categoryId, String sentiment);

    @Query("SELECT COALESCE(AVG(f.rating), 0.0) FROM Feedback f WHERE f.category.id = :categoryId")
    Double getAverageRatingByCategoryId(@Param("categoryId") Long categoryId);
}

