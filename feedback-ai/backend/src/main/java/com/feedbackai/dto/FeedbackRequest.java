package com.feedbackai.dto;
import jakarta.validation.constraints.*;
public record FeedbackRequest(@NotNull Long userId, @NotNull Long categoryId, @NotBlank String message, @NotNull @Min(1) @Max(5) Integer rating) {}
