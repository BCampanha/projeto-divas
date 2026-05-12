package com.ong.divas.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ong.divas.entities.Log;
import com.ong.divas.entities.LoginAttempt;
import com.ong.divas.entities.Usuario;
import com.ong.divas.repository.LogRepository;
import com.ong.divas.repository.LoginAttemptRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class LogService {
    @Autowired
    private LogRepository logRepository;

    @Autowired
    private LoginAttemptRepository loginAttemptRepository;

    public void registrar(String acao, String tabela, Usuario usuario, String anteriores, String novos, HttpServletRequest request) {
        try {
            Log log = new Log();
            log.setAcao(acao);
            log.setTabelaNome(tabela);
            log.setUsuario(usuario);
            log.setDadosAnteriores(anteriores);
            log.setDadosNovos(novos);
            log.setIpOrigem(ip(request));
            log.setUserAgent(userAgent(request));
            logRepository.save(log);
        } catch (Exception ignored) {}
    }

    public void registrarTentativaLogin(Usuario usuario, String emailTentado, boolean sucesso, String motivoFalha, HttpServletRequest request) {
        try {
            LoginAttempt tentativa = new LoginAttempt();
            tentativa.setUsuario(usuario);
            tentativa.setEmailTentado(emailTentado);
            tentativa.setSucesso(sucesso);
            tentativa.setMotivoFalha(motivoFalha);
            tentativa.setIpOrigem(ip(request));
            tentativa.setUserAgent(userAgent(request));
            loginAttemptRepository.save(tentativa);
        } catch (Exception ignored) {}
    }

    private String ip(HttpServletRequest request) {
        if (request == null) return "system";
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "system";
    }

    private String userAgent(HttpServletRequest request) {
        return request != null ? request.getHeader("User-Agent") : "system";
    }
}
