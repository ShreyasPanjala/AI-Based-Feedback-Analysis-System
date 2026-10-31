package com.feedbackai.controller;
import com.feedbackai.entity.User;
import com.feedbackai.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }
    @PostMapping public ResponseEntity<User> create(@Valid @RequestBody User user) { return ResponseEntity.status(HttpStatus.CREATED).body(service.create(user)); }
    @GetMapping public List<User> all() { return service.all(); }
}
