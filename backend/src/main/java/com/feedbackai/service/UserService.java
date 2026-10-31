package com.feedbackai.service;

import com.feedbackai.entity.User;
import com.feedbackai.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class UserService {
    private final UserRepository users;
    public UserService(UserRepository users) { this.users = users; }
    public List<User> all() { return users.findAll(); }
    public User create(User user) {
        user.setEmail(user.getEmail().trim().toLowerCase());
        if (users.existsByEmailIgnoreCase(user.getEmail())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        // Public user creation cannot grant administrative privileges.
        user.setRole(User.Role.USER);
        return users.save(user);
    }
}
