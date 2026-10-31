package com.feedbackai.controller;
import com.feedbackai.entity.Category;
import com.feedbackai.service.CategoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService service;
    public CategoryController(CategoryService service) { this.service = service; }
    @GetMapping public List<Category> all() { return service.all(); }
    @PostMapping public ResponseEntity<Category> create(@Valid @RequestBody Category category) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(category)); }
}
