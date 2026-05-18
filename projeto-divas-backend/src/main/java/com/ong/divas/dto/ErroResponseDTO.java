package com.ong.divas.dto;

import java.time.LocalDateTime;

public class ErroResponseDTO {
    private LocalDateTime timestamp = LocalDateTime.now();
    private int status;
    private String erro;
    private String path;

    public ErroResponseDTO() {}

    public ErroResponseDTO(int status, String erro, String path) {
        this.status = status;
        this.erro = erro;
        this.path = path;
    }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getErro() { return erro; }
    public void setErro(String erro) { this.erro = erro; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}
