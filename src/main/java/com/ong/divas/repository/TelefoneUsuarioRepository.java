package com.ong.divas.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ong.divas.entities.TelefoneUsuario;

public interface TelefoneUsuarioRepository extends JpaRepository<TelefoneUsuario, Long> {
    List<TelefoneUsuario> findByUsuarioIdUsuario(Long idUsuario);
}
