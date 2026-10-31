package com.feedbackai.config;

import com.feedbackai.model.Category;
import com.feedbackai.model.Feedback;
import com.feedbackai.model.Role;
import com.feedbackai.model.User;
import com.feedbackai.repository.CategoryRepository;
import com.feedbackai.repository.FeedbackRepository;
import com.feedbackai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;

    public DataInitializer(CategoryRepository categoryRepository,
                           UserRepository userRepository,
                           FeedbackRepository feedbackRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedUsers();
        seedInitialFeedbacks();
    }

    private void seedCategories() {
        List<String> requiredCategories = Arrays.asList(
                "Academic",
                "Infrastructure",
                "Faculty",
                "Transport",
                "Food",
                "General"
        );

        for (String catName : requiredCategories) {
            if (!categoryRepository.existsByNameIgnoreCase(catName)) {
                categoryRepository.save(new Category(catName));
                log.info("Initialized category: {}", catName);
            }
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            User user1 = new User("Sarah Jenkins", "sarah.jenkins@feedbackai.com", Role.USER);
            User user2 = new User("Michael Chang", "michael.chang@feedbackai.com", Role.USER);
            User admin = new User("System Administrator", "admin@feedbackai.com", Role.ADMIN);

            userRepository.saveAll(Arrays.asList(user1, user2, admin));
            log.info("Initialized primary users");
        }
    }

    private void seedInitialFeedbacks() {
        if (feedbackRepository.count() == 0) {
            List<User> users = userRepository.findAll();
            List<Category> categories = categoryRepository.findAll();

            if (users.size() >= 2 && !categories.isEmpty()) {
                User u1 = users.get(0);
                User u2 = users.get(1);

                Category academic = categoryRepository.findByNameIgnoreCase("Academic").orElse(categories.get(0));
                Category infra = categoryRepository.findByNameIgnoreCase("Infrastructure").orElse(categories.get(0));
                Category faculty = categoryRepository.findByNameIgnoreCase("Faculty").orElse(categories.get(0));
                Category transport = categoryRepository.findByNameIgnoreCase("Transport").orElse(categories.get(0));
                Category food = categoryRepository.findByNameIgnoreCase("Food").orElse(categories.get(0));

                Feedback f1 = new Feedback(u1, academic, "Course curriculum and practical laboratory projects are well structured and very informative.", 5, "POSITIVE");
                Feedback f2 = new Feedback(u2, infra, "Wi-Fi speeds in the study lounge and Block B have frequent connectivity interruptions.", 2, "NEGATIVE");
                Feedback f3 = new Feedback(u1, food, "Cafeteria meals are nutritious and well balanced, though peak lunchtime lines are slow.", 3, "NEUTRAL");
                Feedback f4 = new Feedback(u2, faculty, "Professors are exceptionally supportive and hold accessible office hours for doubt resolution.", 5, "POSITIVE");
                Feedback f5 = new Feedback(u1, transport, "Campus shuttle schedule between north gate and transit station needs clearer departure tracking.", 3, "PENDING");

                feedbackRepository.saveAll(Arrays.asList(f1, f2, f3, f4, f5));
                log.info("Initialized starting feedback records");
            }
        }
    }
}
