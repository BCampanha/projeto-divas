package com.ong.divas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ong.divas.entities.EventoDiva;

public interface EventoDivaRepository extends JpaRepository<EventoDiva, Long> {
}
