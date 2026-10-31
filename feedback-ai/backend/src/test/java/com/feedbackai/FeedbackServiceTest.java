package com.feedbackai;

import com.feedbackai.dto.FeedbackRequest;
import com.feedbackai.entity.*;
import com.feedbackai.exception.ResourceNotFoundException;
import com.feedbackai.repository.*;
import com.feedbackai.service.FeedbackService;
import com.feedbackai.service.SentimentService;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FeedbackServiceTest {
    private final FeedbackRepository feedback = mock(FeedbackRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final CategoryRepository categories = mock(CategoryRepository.class);
    private final SentimentService sentiment = mock(SentimentService.class);
    private final FeedbackService service = new FeedbackService(feedback, users, categories, sentiment);

    @Test void savesPendingFeedbackWithResolvedReferences() {
        User user = new User();
        Category category = new Category("Academic");
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(categories.findById(2L)).thenReturn(Optional.of(category));
        when(sentiment.analyze("Helpful")).thenReturn("POSITIVE");
        when(feedback.saveAndFlush(any(Feedback.class))).thenAnswer(call -> call.getArgument(0));
        var result = service.create(new FeedbackRequest(1L, 2L, "Helpful", 5));
        assertEquals("POSITIVE", result.sentiment());
        var saved = org.mockito.ArgumentCaptor.forClass(Feedback.class);
        verify(feedback).saveAndFlush(saved.capture());
        assertSame(user, saved.getValue().getUser());
        assertSame(category, saved.getValue().getCategory());
        assertEquals(5, saved.getValue().getRating());
    }
    @Test void missingUserReturnsNotFoundException() {
        when(users.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.create(new FeedbackRequest(99L, 1L, "Test", 3)));
        verifyNoInteractions(categories, feedback);
    }
}
