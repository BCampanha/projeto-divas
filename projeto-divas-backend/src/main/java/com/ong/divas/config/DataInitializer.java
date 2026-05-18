package com.ong.divas.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ong.divas.entities.Usuario;
import com.ong.divas.enums.TipoUsuario;
import com.ong.divas.repository.UsuarioRepository;

@Configuration
public class DataInitializer {

    @Bean
    public ApplicationRunner promoverAdmin(UsuarioRepository repo) {
        return args -> {
            Usuario u = repo.findByEmail("elaine.projeto422@gmail.com");
            if (u != null && u.getTipoUsuario() != TipoUsuario.administrador) {
                u.setTipoUsuario(TipoUsuario.administrador);
                repo.save(u);
                System.out.println(">>> Admin promovida: " + u.getEmail());
            }
        };
    }
}
