package com.ong.divas.dto;

import com.ong.divas.entities.Usuario;
import com.ong.divas.enums.TipoUsuario;

public class LoginResponseDTO {

    private String token;
    private String tipoToken = "Bearer";
    private Long idUsuario;
    private String nome;
    private String email;
    private TipoUsuario tipoUsuario;

    public LoginResponseDTO() {}

    public LoginResponseDTO(String token, Usuario usuario) {
        this.token = token;
        this.idUsuario = usuario.getIdUsuario();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.tipoUsuario = usuario.getTipoUsuario();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTipoToken() { return tipoToken; }
    public void setTipoToken(String tipoToken) { this.tipoToken = tipoToken; }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario tipoUsuario) { this.tipoUsuario = tipoUsuario; }
}
