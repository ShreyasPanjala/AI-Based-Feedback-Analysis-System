package com.feedbackai.config;

import com.feedbackai.entity.*;
import com.feedbackai.repository.*;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;

@Configuration
public class DataSeeder {
    @Bean CommandLineRunner seedData(UserRepository users, CategoryRepository categories) {
        return args -> {
            if (categories.count() == 0) categories.saveAll(List.of(new Category("Academic"), new Category("Infrastructure"),
                new Category("Faculty"), new Category("Transport"), new Category("Food"), new Category("General")));
            if (users.count() == 0) {
                users.saveAll(List.of(user("Shreyas", "shreyas@example.com"), user("Demo Student", "student@example.com"),
                    user("Demo Employee", "employee@example.com")));
            }
        };
    }
    private User user(String name, String email) { User user = new User(); user.setName(name); user.setEmail(email); return user; }
}
