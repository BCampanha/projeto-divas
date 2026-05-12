package com.ong.divas.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ong.divas.entities.Usuario;

@Service
public class JwtService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jwt.secret:projeto-divas-chave-secreta-local-desenvolvimento-precisa-ser-grande}")
    private String secret;

    @Value("${jwt.expiration-hours:8}")
    private long expirationHours;

    public String gerarToken(Usuario usuario) {
        try {
            Map<String, Object> header = new LinkedHashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Instant agora = Instant.now();
            Instant expiracao = agora.plusSeconds(expirationHours * 60 * 60);

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("idUsuario", usuario.getIdUsuario());
            payload.put("email", usuario.getEmail());
            payload.put("tipoUsuario", usuario.getTipoUsuario().name());
            payload.put("iat", agora.getEpochSecond());
            payload.put("exp", expiracao.getEpochSecond());

            String headerBase64 = base64Url(objectMapper.writeValueAsBytes(header));
            String payloadBase64 = base64Url(objectMapper.writeValueAsBytes(payload));
            String conteudo = headerBase64 + "." + payloadBase64;
            String assinatura = assinar(conteudo);

            return conteudo + "." + assinatura;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar token JWT", e);
        }
    }

    public boolean tokenValido(String token) {
        try {
            Map<String, Object> claims = getClaims(token);
            Object exp = claims.get("exp");

            if (exp == null) {
                return false;
            }

            long expSegundos = Long.parseLong(exp.toString());
            return Instant.now().getEpochSecond() < expSegundos;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmail(String token) {
        Object email = getClaims(token).get("email");
        return email == null ? null : email.toString();
    }

    public String getTipoUsuario(String token) {
        Object tipo = getClaims(token).get("tipoUsuario");
        return tipo == null ? null : tipo.toString();
    }

    public Long getIdUsuario(String token) {
        Object id = getClaims(token).get("idUsuario");
        return id == null ? null : Long.valueOf(id.toString());
    }

    public Map<String, Object> getClaims(String token) {
        try {
            String[] partes = token.split("\\.");
            if (partes.length != 3) {
                throw new RuntimeException("Token inválido");
            }

            String conteudo = partes[0] + "." + partes[1];
            String assinaturaCorreta = assinar(conteudo);

            if (!assinaturaCorreta.equals(partes[2])) {
                throw new RuntimeException("Assinatura inválida");
            }

            byte[] payload = Base64.getUrlDecoder().decode(partes[1]);
            return objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Token inválido", e);
        }
    }

    public Date getDataExpiracao(String token) {
        Object exp = getClaims(token).get("exp");
        long expSegundos = Long.parseLong(exp.toString());
        return Date.from(Instant.ofEpochSecond(expSegundos));
    }

    private String assinar(String conteudo) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        return base64Url(mac.doFinal(conteudo.getBytes(StandardCharsets.UTF_8)));
    }

    private String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
