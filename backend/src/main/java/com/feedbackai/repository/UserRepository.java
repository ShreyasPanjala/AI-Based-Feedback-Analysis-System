package com.feedbackai.repository;
import com.feedbackai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> { boolean existsByEmailIgnoreCase(String email); }
