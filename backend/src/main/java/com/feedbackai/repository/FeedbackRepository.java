package com.feedbackai.repository;
import com.feedbackai.entity.Feedback;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    @Override @EntityGraph(attributePaths = {"user", "category"}) List<Feedback> findAll();
    @EntityGraph(attributePaths = {"user", "category"}) List<Feedback> findByCategoryId(Long categoryId);
    @EntityGraph(attributePaths = {"user", "category"}) List<Feedback> findBySentimentIgnoreCase(String sentiment);
}
