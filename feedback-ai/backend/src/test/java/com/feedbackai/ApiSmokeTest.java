package com.feedbackai;

import com.feedbackai.config.SecurityConfig;
import com.feedbackai.controller.*;
import com.feedbackai.dto.*;
import com.feedbackai.exception.GlobalExceptionHandler;
import com.feedbackai.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({UserController.class, CategoryController.class, FeedbackController.class, ReportController.class})
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class ApiSmokeTest {
    @Autowired MockMvc mvc;
    @MockitoBean UserService users;
    @MockitoBean CategoryService categories;
    @MockitoBean FeedbackService feedback;
    @MockitoBean ReportService reports;

    @Test void publicCategories() throws Exception {
        when(categories.all()).thenReturn(List.of());
        mvc.perform(get("/api/categories")).andExpect(status().isOk()).andExpect(content().json("[]"));
    }
    @Test void publicFeedbackCreatesPending() throws Exception {
        when(feedback.create(any())).thenReturn(new FeedbackResponse(1L, 1L, 1L, "Clear explanation", 5, "PENDING", Instant.parse("2026-01-01T00:00:00Z")));
        mvc.perform(post("/api/feedback").contentType("application/json")
            .content("{\"userId\":1,\"categoryId\":1,\"message\":\"Clear explanation\",\"rating\":5}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.sentiment").value("PENDING"));
    }
    @Test void invalidRatingIsBadRequest() throws Exception {
        mvc.perform(post("/api/feedback").contentType("application/json")
            .content("{\"userId\":1,\"categoryId\":1,\"message\":\"Test\",\"rating\":7}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fields.rating").exists());
    }
    @Test void reportRequiresAdmin() throws Exception {
        mvc.perform(get("/api/reports/summary")).andExpect(status().isUnauthorized());
        when(reports.summary()).thenReturn(new ReportSummaryResponse(0, 0, 0, 0, 0, 0));
        String credentials = Base64.getEncoder().encodeToString("admin:admin123".getBytes(StandardCharsets.UTF_8));
        mvc.perform(get("/api/reports/summary").header("Authorization", "Basic " + credentials))
            .andExpect(status().isOk()).andExpect(jsonPath("$.pending").value(0));
    }
}
