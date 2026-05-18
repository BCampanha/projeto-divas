package com.ong.divas.dto;

public class MensagemResponseDTO {
    private String mensagem;

    public MensagemResponseDTO() {}
    public MensagemResponseDTO(String mensagem) { this.mensagem = mensagem; }

    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
}
