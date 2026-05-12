package com.ong.divas.dto;

import java.time.LocalDateTime;

import com.ong.divas.entities.EventoDiva;

public class EventoDivaDTO {
    private Long idEvento;
    private Long idUsuario;
    private String nomeUsuario;
    private Long idLocal;
    private String nomeLocal;
    private String tipoEvento;
    private String titulo;
    private String descricao;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private String status;
    private LocalDateTime criadoEm;

    public EventoDivaDTO() {}
    public EventoDivaDTO(EventoDiva e) {
        this.idEvento = e.getIdEvento();
        this.idUsuario = e.getUsuario() != null ? e.getUsuario().getIdUsuario() : null;
        this.nomeUsuario = e.getUsuario() != null ? e.getUsuario().getNome() : null;
        this.idLocal = e.getLocalidade() != null ? e.getLocalidade().getIdLocal() : null;
        this.nomeLocal = e.getLocalidade() != null ? e.getLocalidade().getNomeLocal() : null;
        this.tipoEvento = e.getTipoEvento();
        this.titulo = e.getTitulo();
        this.descricao = e.getDescricao();
        this.dataInicio = e.getDataInicio();
        this.dataFim = e.getDataFim();
        this.status = e.getStatus();
        this.criadoEm = e.getCriadoEm();
    }
    public Long getIdEvento() { return idEvento; }
    public Long getIdUsuario() { return idUsuario; }
    public String getNomeUsuario() { return nomeUsuario; }
    public Long getIdLocal() { return idLocal; }
    public String getNomeLocal() { return nomeLocal; }
    public String getTipoEvento() { return tipoEvento; }
    public String getTitulo() { return titulo; }
    public String getDescricao() { return descricao; }
    public LocalDateTime getDataInicio() { return dataInicio; }
    public LocalDateTime getDataFim() { return dataFim; }
    public String getStatus() { return status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
