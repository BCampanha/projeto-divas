package com.ong.divas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ong.divas.entities.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByEmail(String email);
    Optional<Usuario> findOptionalByEmail(String email);
}
