package com.ong.divas.dto;

public class ResetSenhaDTO {
    private String token;
    private String novaSenha;
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getNovaSenha() { return novaSenha; }
    public void setNovaSenha(String novaSenha) { this.novaSenha = novaSenha; }
}
