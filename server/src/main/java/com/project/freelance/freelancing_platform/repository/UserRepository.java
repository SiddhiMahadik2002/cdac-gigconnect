package com.project.freelance.freelancing_platform.repository;

import com.project.freelance.freelancing_platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
