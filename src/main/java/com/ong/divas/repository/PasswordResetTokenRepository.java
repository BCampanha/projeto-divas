package com.ong.divas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ong.divas.entities.PasswordResetToken;
import com.ong.divas.entities.Usuario;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenAndUsadoFalse(String token);
    void deleteByUsuarioAndUsadoFalse(Usuario usuario);
}
