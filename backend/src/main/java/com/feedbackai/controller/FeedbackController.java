package com.feedbackai.controller;
import com.feedbackai.dto.*;
import com.feedbackai.service.FeedbackService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/feedback")
public class FeedbackController {
    private final FeedbackService service;
    public FeedbackController(FeedbackService service) { this.service = service; }
    @PostMapping public ResponseEntity<FeedbackResponse> create(@Valid @RequestBody FeedbackRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request)); }
    @GetMapping public List<FeedbackResponse> all() { return service.all(); }
    @GetMapping("/{id}") public FeedbackResponse one(@PathVariable Long id) { return service.one(id); }
    @GetMapping("/category/{categoryId}") public List<FeedbackResponse> byCategory(@PathVariable Long categoryId) { return service.byCategory(categoryId); }
    @GetMapping("/sentiment/{sentiment}") public List<FeedbackResponse> bySentiment(@PathVariable String sentiment) { return service.bySentiment(sentiment); }
}
