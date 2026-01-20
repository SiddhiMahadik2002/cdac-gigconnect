package com.project.freelance.freelancing_platform.repository;

import com.project.freelance.freelancing_platform.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
}
