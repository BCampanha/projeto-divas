package com.ong.divas.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ong.divas.dto.AgendamentoDTO;
import com.ong.divas.entities.Agendamento;
import com.ong.divas.entities.Usuario;
import com.ong.divas.services.AgendaService;

@RestController
@RequestMapping({"/agendamentos", "/agenda"})
public class AgendaController {

    @Autowired
    private AgendaService service;

    @PostMapping
    public ResponseEntity<AgendamentoDTO> criar(@RequestBody Agendamento agendamento, @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.criar(agendamento, autenticado));
    }

    @PostMapping("/criar")
    public ResponseEntity<AgendamentoDTO> criarCompatibilidade(@RequestBody Agendamento agendamento, @AuthenticationPrincipal Usuario autenticado) {
        return criar(agendamento, autenticado);
    }

    @GetMapping
    public ResponseEntity<List<AgendamentoDTO>> listar(@AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.listar(autenticado));
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<AgendamentoDTO>> listarPorUsuario(@PathVariable Long idUsuario, @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.listarPorUsuario(idUsuario, autenticado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoDTO> buscar(@PathVariable Long id, @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.buscarPorId(id, autenticado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendamentoDTO> atualizar(@PathVariable Long id, @RequestBody Agendamento agendamento, @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.atualizar(id, agendamento, autenticado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario autenticado) {
        service.deletar(id, autenticado);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filtrar")
    public ResponseEntity<List<AgendamentoDTO>> filtrar(
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.filtrar(usuarioId, data, autenticado));
    }
}
