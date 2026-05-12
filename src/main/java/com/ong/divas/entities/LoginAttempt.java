package com.ong.divas.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "login_attempts")
public class LoginAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tentativa")
    private Long idTentativa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "email_tentado", length = 150)
    private String emailTentado;

    @Column(name = "sucesso", nullable = false)
    private Boolean sucesso;

    @Column(name = "motivo_falha", length = 50)
    private String motivoFalha;

    @Column(name = "ip_origem", nullable = false, length = 45)
    private String ipOrigem;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "data_hora_tentativa", nullable = false, updatable = false)
    private LocalDateTime dataHoraTentativa;

    @PrePersist
    public void prePersist() {
        if (dataHoraTentativa == null) dataHoraTentativa = LocalDateTime.now();
        if (ipOrigem == null || ipOrigem.isBlank()) ipOrigem = "system";
    }

    public Long getIdTentativa() { return idTentativa; }
    public void setIdTentativa(Long idTentativa) { this.idTentativa = idTentativa; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getEmailTentado() { return emailTentado; }
    public void setEmailTentado(String emailTentado) { this.emailTentado = emailTentado; }
    public Boolean getSucesso() { return sucesso; }
    public void setSucesso(Boolean sucesso) { this.sucesso = sucesso; }
    public String getMotivoFalha() { return motivoFalha; }
    public void setMotivoFalha(String motivoFalha) { this.motivoFalha = motivoFalha; }
    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public LocalDateTime getDataHoraTentativa() { return dataHoraTentativa; }
    public void setDataHoraTentativa(LocalDateTime dataHoraTentativa) { this.dataHoraTentativa = dataHoraTentativa; }
}
