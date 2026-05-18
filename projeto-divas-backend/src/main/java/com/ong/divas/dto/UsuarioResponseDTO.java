package com.ong.divas.dto;

import java.time.LocalDateTime;

import com.ong.divas.entities.Usuario;
import com.ong.divas.enums.TipoUsuario;

public class UsuarioResponseDTO {
    private Long idUsuario;
    private TipoUsuario tipoUsuario;
    private String nome;
    private String email;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimoLogin;
    private Boolean ativo;

    public UsuarioResponseDTO() {}

    public UsuarioResponseDTO(Usuario usuario) {
        this.idUsuario = usuario.getIdUsuario();
        this.tipoUsuario = usuario.getTipoUsuario();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.dataCadastro = usuario.getDataCadastro();
        this.ultimoLogin = usuario.getUltimoLogin();
        this.ativo = usuario.getAtivo();
    }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario tipoUsuario) { this.tipoUsuario = tipoUsuario; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }
    public LocalDateTime getUltimoLogin() { return ultimoLogin; }
    public void setUltimoLogin(LocalDateTime ultimoLogin) { this.ultimoLogin = ultimoLogin; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
