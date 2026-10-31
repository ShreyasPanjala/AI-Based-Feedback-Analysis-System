package com.feedbackai.service;

import com.feedbackai.entity.Category;
import com.feedbackai.repository.CategoryRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CategoryService {
    private final CategoryRepository categories;
    public CategoryService(CategoryRepository categories) { this.categories = categories; }
    public List<Category> all() { return categories.findAll(); }
    public Category create(Category category) {
        category.setName(category.getName().trim());
        if (categories.existsByNameIgnoreCase(category.getName())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        return categories.save(category);
    }
}
