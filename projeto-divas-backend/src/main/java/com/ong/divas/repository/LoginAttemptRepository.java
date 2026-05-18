package com.ong.divas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ong.divas.entities.LoginAttempt;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
}
