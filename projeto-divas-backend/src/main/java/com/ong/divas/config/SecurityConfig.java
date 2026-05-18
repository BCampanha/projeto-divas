package com.ong.divas.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ong.divas.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/usuarios/criar").permitAll()
                .requestMatchers(HttpMethod.POST, "/usuarios/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/usuarios/esqueci-senha").permitAll()
                .requestMatchers(HttpMethod.POST, "/usuarios/resetar-senha").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers(HttpMethod.GET, "/usuarios/todos").hasAuthority("administrador")
                .requestMatchers(HttpMethod.DELETE, "/usuarios/deletar/**").hasAuthority("administrador")
                .requestMatchers(HttpMethod.PUT, "/usuarios/atualizar/**").hasAnyAuthority("administrador", "beneficiaria")
                .requestMatchers(HttpMethod.GET, "/usuarios/**").hasAnyAuthority("administrador", "beneficiaria")

                .requestMatchers(HttpMethod.POST, "/eventos-divas/*/salvar-na-agenda/*").hasAuthority("beneficiaria")
                .requestMatchers(HttpMethod.POST, "/eventos-divas/salvar-evento-publico/*/usuario/*").hasAuthority("beneficiaria")
                .requestMatchers(HttpMethod.POST, "/eventos-divas/**").hasAuthority("administrador")
                .requestMatchers(HttpMethod.PUT, "/eventos-divas/**").hasAuthority("administrador")
                .requestMatchers(HttpMethod.DELETE, "/eventos-divas/**").hasAuthority("administrador")
                .requestMatchers(HttpMethod.GET, "/eventos-divas", "/eventos-divas/**").hasAnyAuthority("administrador", "beneficiaria")

                .requestMatchers(HttpMethod.POST, "/localidades", "/localidades/**").hasAnyAuthority("administrador", "beneficiaria")
                .requestMatchers(HttpMethod.PUT, "/localidades", "/localidades/**").hasAuthority("administrador")
                .requestMatchers(HttpMethod.DELETE, "/localidades", "/localidades/**").hasAuthority("administrador")
                .requestMatchers(HttpMethod.GET, "/localidades", "/localidades/**").hasAnyAuthority("administrador", "beneficiaria")

                .requestMatchers("/agendamentos", "/agendamentos/**", "/agenda", "/agenda/**").hasAnyAuthority("administrador", "beneficiaria")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8081",
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
