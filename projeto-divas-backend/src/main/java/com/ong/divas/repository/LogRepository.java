package com.ong.divas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ong.divas.entities.Log;

public interface LogRepository extends JpaRepository<Log, Long> {
}
