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

import com.ong.divas.dto.EmailDTO;
import com.ong.divas.dto.LoginResponseDTO;
import com.ong.divas.dto.MensagemResponseDTO;
import com.ong.divas.dto.ResetSenhaDTO;
import com.ong.divas.dto.UsuarioDTO;
import com.ong.divas.dto.UsuarioResponseDTO;
import com.ong.divas.entities.Usuario;
import com.ong.divas.services.UsuarioService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/criar")
    public ResponseEntity<UsuarioResponseDTO> cadastrar(@RequestBody UsuarioDTO dto, HttpServletRequest request) {
        return ResponseEntity.ok(usuarioService.cadastrarUsuario(dto, request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody UsuarioDTO dto, HttpServletRequest request) {
        return ResponseEntity.ok(usuarioService.login(dto.getEmail(), dto.getSenha(), request));
    }

    @GetMapping("/todos")
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id, @AuthenticationPrincipal Usuario autenticado) {
        return ResponseEntity.ok(usuarioService.buscarId(id, autenticado));
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<MensagemResponseDTO> deletar(@PathVariable Long id, HttpServletRequest request) {
        return ResponseEntity.ok(usuarioService.deleteUsuario(id, request));
    }

    @PutMapping("/atualizar/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Long id, @RequestBody UsuarioDTO dto,
            @AuthenticationPrincipal Usuario autenticado, HttpServletRequest request) {
        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, dto, autenticado, request));
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<MensagemResponseDTO> esqueciSenha(@RequestBody EmailDTO dto, HttpServletRequest request) {
        return ResponseEntity.ok(usuarioService.esqueciSenha(dto.getEmail(), request));
    }

    @PostMapping("/resetar-senha")
    public ResponseEntity<MensagemResponseDTO> resetarSenha(@RequestBody ResetSenhaDTO dto, HttpServletRequest request) {
        return ResponseEntity.ok(usuarioService.resetarSenha(dto.getToken(), dto.getNovaSenha(), request));
    }
}
