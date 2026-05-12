package com.ong.divas.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ong.divas.dto.AgendamentoDTO;
import com.ong.divas.dto.EventoDivaDTO;
import com.ong.divas.entities.EventoDiva;
import com.ong.divas.entities.Usuario;
import com.ong.divas.services.EventoDivaService;

@RestController
@RequestMapping("/eventos-divas")
public class EventoDivaController {

    @Autowired
    private EventoDivaService service;

    @PostMapping
    public ResponseEntity<EventoDivaDTO> criar(@RequestBody EventoDiva evento, @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.criarEventoPublico(evento, autenticado));
    }

    @PostMapping("/criar")
    public ResponseEntity<EventoDivaDTO> criarCompatibilidade(@RequestBody EventoDiva evento, @AuthenticationPrincipal Usuario autenticado) {
        return criar(evento, autenticado);
    }

    @GetMapping
    public ResponseEntity<List<EventoDivaDTO>> listar() {
        return ResponseEntity.ok(service.listarEventosPublicos());
    }

    @GetMapping("/publicos")
    public ResponseEntity<List<EventoDivaDTO>> listarPublicos() {
        return listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoDivaDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarEventoPublico(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoDivaDTO> atualizar(@PathVariable Long id, @RequestBody EventoDiva evento,
            @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.atualizarEventoPublico(id, evento, autenticado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario autenticado) {
        service.deletarEventoPublico(id, autenticado);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{idEvento}/salvar-na-agenda/{idUsuario}")
    public ResponseEntity<AgendamentoDTO> salvarNaAgenda(@PathVariable Long idEvento, @PathVariable Long idUsuario,
            @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(service.salvarEventoNaAgendaDaBeneficiaria(idEvento, idUsuario, autenticado));
    }

    @PostMapping("/salvar-evento-publico/{idEvento}/usuario/{idUsuario}")
    public ResponseEntity<AgendamentoDTO> salvarNaAgendaCompatibilidade(@PathVariable Long idEvento, @PathVariable Long idUsuario,
            @AuthenticationPrincipal Usuario autenticado) {
        return salvarNaAgenda(idEvento, idUsuario, autenticado);
    }
}
