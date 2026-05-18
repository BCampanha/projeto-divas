package com.ong.divas.dto;

import java.time.LocalDateTime;

import com.ong.divas.entities.Agendamento;

public class AgendamentoDTO {
    private Long idAgendamento;
    private Long idUsuario;
    private String nomeUsuario;
    private Long idLocal;
    private String nomeLocal;
    private String tipoEvento;
    private String descricao;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private String status;
    private LocalDateTime criadoEm;

    public AgendamentoDTO() {}
    public AgendamentoDTO(Agendamento a) {
        this.idAgendamento = a.getIdAgendamento();
        this.idUsuario = a.getUsuario() != null ? a.getUsuario().getIdUsuario() : null;
        this.nomeUsuario = a.getUsuario() != null ? a.getUsuario().getNome() : null;
        this.idLocal = a.getLocalidade() != null ? a.getLocalidade().getIdLocal() : null;
        this.nomeLocal = a.getLocalidade() != null ? a.getLocalidade().getNomeLocal() : null;
        this.tipoEvento = a.getTipoEvento();
        this.descricao = a.getDescricao();
        this.dataInicio = a.getDataInicio();
        this.dataFim = a.getDataFim();
        this.status = a.getStatus();
        this.criadoEm = a.getCriadoEm();
    }
    public Long getIdAgendamento() { return idAgendamento; }
    public Long getIdUsuario() { return idUsuario; }
    public String getNomeUsuario() { return nomeUsuario; }
    public Long getIdLocal() { return idLocal; }
    public String getNomeLocal() { return nomeLocal; }
    public String getTipoEvento() { return tipoEvento; }
    public String getDescricao() { return descricao; }
    public LocalDateTime getDataInicio() { return dataInicio; }
    public LocalDateTime getDataFim() { return dataFim; }
    public String getStatus() { return status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
