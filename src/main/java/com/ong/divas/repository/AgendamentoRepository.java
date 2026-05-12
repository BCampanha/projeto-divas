package com.ong.divas.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ong.divas.entities.Agendamento;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByUsuarioIdUsuario(Long idUsuario);

    boolean existsByUsuarioIdUsuarioAndDescricaoContaining(Long idUsuario, String trechoDescricao);

    @Query("SELECT a FROM Agendamento a WHERE a.usuario.idUsuario = :usuarioId " +
           "AND (:dataFim IS NULL OR a.dataFim IS NULL OR (a.dataInicio < :dataFim AND a.dataFim > :dataInicio))")
    List<Agendamento> verificarConflito(
            @Param("usuarioId") Long usuarioId,
            @Param("dataInicio") LocalDateTime dataInicio,
            @Param("dataFim") LocalDateTime dataFim
    );

    @Query("SELECT a FROM Agendamento a WHERE " +
           "(:usuarioId IS NULL OR a.usuario.idUsuario = :usuarioId) AND " +
           "(:data IS NULL OR FUNCTION('DATE', a.dataInicio) = :data)")
    List<Agendamento> filtrar(
            @Param("usuarioId") Long usuarioId,
            @Param("data") LocalDate data
    );
}
