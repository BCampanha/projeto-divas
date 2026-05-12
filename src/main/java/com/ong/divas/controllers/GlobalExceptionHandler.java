package com.ong.divas.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ong.divas.dto.ErroResponseDTO;
import com.ong.divas.exceptions.AcessoNegadoException;
import com.ong.divas.exceptions.NaoEncontradoException;
import com.ong.divas.exceptions.RegraNegocioException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponseDTO> regra(RegraNegocioException ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(new ErroResponseDTO(400, ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(NaoEncontradoException.class)
    public ResponseEntity<ErroResponseDTO> naoEncontrado(NaoEncontradoException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErroResponseDTO(404, ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ErroResponseDTO> acesso(AcessoNegadoException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErroResponseDTO(403, ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponseDTO> geral(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErroResponseDTO(500, "Erro interno: " + ex.getMessage(), request.getRequestURI()));
    }
}
