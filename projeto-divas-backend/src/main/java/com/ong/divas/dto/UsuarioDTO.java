package com.ong.divas.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ong.divas.entities.Usuario;
import com.ong.divas.enums.TipoUsuario;

public class UsuarioDTO {

    private Long id;
    private String nome;
    private String email;
    private String senha;
    private TipoUsuario tipoUsuario;
    private Boolean ativo;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime ultimoLogin;

    public UsuarioDTO() {}

    public UsuarioDTO(Usuario entity) {
        this.id = entity.getIdUsuario();
        this.nome = entity.getNome();
        this.email = entity.getEmail();
        this.tipoUsuario = entity.getTipoUsuario();
        this.ativo = entity.getAtivo();
        this.ultimoLogin = entity.getUltimoLogin();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario tipoUsuario) { this.tipoUsuario = tipoUsuario; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public LocalDateTime getUltimoLogin() {
        return ultimoLogin;
    }

    public void setUltimoLogin(LocalDateTime ultimoLogin) {
        this.ultimoLogin = ultimoLogin;
    }
}