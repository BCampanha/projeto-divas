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
@Table(name = "logs")
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_log")
    private Long idLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "acao", nullable = false, length = 50)
    private String acao;

    @Column(name = "tabela_nome", nullable = false, length = 50)
    private String tabelaNome;

    @Column(name = "dados_anteriores", columnDefinition = "json")
    private String dadosAnteriores;

    @Column(name = "dados_novos", columnDefinition = "json")
    private String dadosNovos;

    @Column(name = "ip_origem", nullable = false, length = 45)
    private String ipOrigem;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "data_hora_log", nullable = false, updatable = false)
    private LocalDateTime dataHoraLog;

    @PrePersist
    public void prePersist() {
        if (dataHoraLog == null) dataHoraLog = LocalDateTime.now();
        if (ipOrigem == null || ipOrigem.isBlank()) ipOrigem = "system";
    }

    public Long getIdLog() { return idLog; }
    public void setIdLog(Long idLog) { this.idLog = idLog; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }
    public String getTabelaNome() { return tabelaNome; }
    public void setTabelaNome(String tabelaNome) { this.tabelaNome = tabelaNome; }
    public String getDadosAnteriores() { return dadosAnteriores; }
    public void setDadosAnteriores(String dadosAnteriores) { this.dadosAnteriores = dadosAnteriores; }
    public String getDadosNovos() { return dadosNovos; }
    public void setDadosNovos(String dadosNovos) { this.dadosNovos = dadosNovos; }
    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public LocalDateTime getDataHoraLog() { return dataHoraLog; }
    public void setDataHoraLog(LocalDateTime dataHoraLog) { this.dataHoraLog = dataHoraLog; }
}
