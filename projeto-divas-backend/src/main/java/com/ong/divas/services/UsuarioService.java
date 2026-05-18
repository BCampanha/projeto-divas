package com.ong.divas.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ong.divas.dto.LoginResponseDTO;
import com.ong.divas.dto.MensagemResponseDTO;
import com.ong.divas.dto.UsuarioDTO;
import com.ong.divas.dto.UsuarioResponseDTO;
import com.ong.divas.entities.PasswordResetToken;
import com.ong.divas.entities.Usuario;
import com.ong.divas.enums.TipoUsuario;
import com.ong.divas.exceptions.AcessoNegadoException;
import com.ong.divas.exceptions.NaoEncontradoException;
import com.ong.divas.exceptions.RegraNegocioException;
import com.ong.divas.repository.PasswordResetTokenRepository;
import com.ong.divas.repository.UsuarioRepository;
import com.ong.divas.security.JwtService;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private LogService logService;

    public UsuarioResponseDTO cadastrarUsuario(UsuarioDTO dto, HttpServletRequest request) {
        validarCadastro(dto);

        if (usuarioRepository.findByEmail(dto.getEmail()) != null) {
            throw new RegraNegocioException("Email já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome().trim());
        usuario.setEmail(dto.getEmail().trim().toLowerCase());
        usuario.setSenhaHash(passwordEncoder.encode(dto.getSenha()));
        usuario.setTipoUsuario(dto.getTipoUsuario() != null ? dto.getTipoUsuario() : TipoUsuario.beneficiaria);
        usuario.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        usuario = usuarioRepository.save(usuario);
        logService.registrar("INSERT", "usuarios", usuario, null,
                "{\"id_usuario\":" + usuario.getIdUsuario() + ",\"email\":\"" + usuario.getEmail() + "\"}", request);
        return new UsuarioResponseDTO(usuario);
    }

    public LoginResponseDTO login(String email, String senha, HttpServletRequest request) {
        if (email == null || email.isBlank() || senha == null || senha.isBlank()) {
            logService.registrarTentativaLogin(null, email, false, "campos_obrigatorios", request);
            throw new RegraNegocioException("Email e senha são obrigatórios");
        }

        Usuario usuario = usuarioRepository.findByEmail(email.trim().toLowerCase());

        if (usuario == null) {
            logService.registrarTentativaLogin(null, email, false, "usuario_nao_encontrado", request);
            throw new NaoEncontradoException("Usuário não encontrado");
        }

        if (Boolean.FALSE.equals(usuario.getAtivo())) {
            logService.registrarTentativaLogin(usuario, email, false, "usuario_inativo", request);
            throw new AcessoNegadoException("Usuário inativo");
        }

        if (!passwordEncoder.matches(senha, usuario.getSenhaHash())) {
            logService.registrarTentativaLogin(usuario, email, false, "senha_incorreta", request);
            throw new AcessoNegadoException("Senha incorreta");
        }

        usuario.setUltimoLogin(LocalDateTime.now());
        usuarioRepository.save(usuario);
        logService.registrarTentativaLogin(usuario, email, true, null, request);

        String token = jwtService.gerarToken(usuario);
        return new LoginResponseDTO(token, usuario);
    }

    public List<UsuarioResponseDTO> listar() {
        return usuarioRepository.findAll().stream().map(UsuarioResponseDTO::new).toList();
    }

    public UsuarioResponseDTO buscarId(Long id, Usuario autenticado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
        if (autenticado.getTipoUsuario() != TipoUsuario.administrador && !autenticado.getIdUsuario().equals(id)) {
            throw new AcessoNegadoException("Beneficiária só pode consultar o próprio usuário");
        }
        return new UsuarioResponseDTO(usuario);
    }

    public MensagemResponseDTO deleteUsuario(Long id, HttpServletRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
        usuarioRepository.deleteById(id);
        logService.registrar("DELETE", "usuarios", usuario,
                "{\"id_usuario\":" + id + ",\"email\":\"" + usuario.getEmail() + "\"}", null, request);
        return new MensagemResponseDTO("Usuário deletado");
    }

    public UsuarioResponseDTO atualizarUsuario(Long id, UsuarioDTO dto, Usuario autenticado, HttpServletRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        if (autenticado.getTipoUsuario() != TipoUsuario.administrador && !autenticado.getIdUsuario().equals(id)) {
            throw new AcessoNegadoException("Beneficiária só pode atualizar o próprio usuário");
        }

        String dadosAnteriores = "{\"nome\":\"" + usuario.getNome() + "\",\"email\":\"" + usuario.getEmail() + "\",\"tipoUsuario\":\"" + usuario.getTipoUsuario() + "\"}";

        if (dto.getNome() != null && !dto.getNome().isBlank()) usuario.setNome(dto.getNome().trim());
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) usuario.setEmail(dto.getEmail().trim().toLowerCase());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) usuario.setSenhaHash(passwordEncoder.encode(dto.getSenha()));

        if (autenticado.getTipoUsuario() == TipoUsuario.administrador) {
            if (dto.getTipoUsuario() != null) usuario.setTipoUsuario(dto.getTipoUsuario());
            if (dto.getAtivo() != null) usuario.setAtivo(dto.getAtivo());
        }

        usuario = usuarioRepository.save(usuario);
        logService.registrar("UPDATE", "usuarios", usuario, dadosAnteriores,
                "{\"nome\":\"" + usuario.getNome() + "\",\"email\":\"" + usuario.getEmail() + "\",\"tipoUsuario\":\"" + usuario.getTipoUsuario() + "\"}", request);
        return new UsuarioResponseDTO(usuario);
    }

    @Transactional
    public MensagemResponseDTO esqueciSenha(String email, HttpServletRequest request) {
        if (email == null || email.isBlank()) throw new RegraNegocioException("Email é obrigatório");

        Usuario usuario = usuarioRepository.findByEmail(email.trim().toLowerCase());
        if (usuario == null) throw new NaoEncontradoException("Usuário não encontrado");

        resetTokenRepository.deleteByUsuarioAndUsadoFalse(usuario);

        String token = gerarTokenCurto();
        PasswordResetToken reset = new PasswordResetToken();
        reset.setUsuario(usuario);
        reset.setToken(token);
        reset.setExpiraEm(LocalDateTime.now().plusMinutes(30));
        resetTokenRepository.save(reset);

        logService.registrar("RESET_TOKEN", "password_reset_tokens", usuario, null,
                "{\"email\":\"" + usuario.getEmail() + "\"}", request);

        try {
            emailService.enviarEmail(
                    usuario.getEmail(),
                    "Recuperação de senha - Projeto Divas",
                    "Seu código de recuperação é: " + token + "\n\nUse esse código no site para redefinir sua senha. Ele expira em 30 minutos."
            );
        } catch (Exception e) {
            System.err.println("[AVISO] Falha ao enviar email para " + usuario.getEmail() + ": " + e.getMessage());
        }

        return new MensagemResponseDTO("Email enviado");
    }

    public MensagemResponseDTO resetarSenha(String token, String novaSenha, HttpServletRequest request) {
        if (token == null || token.isBlank()) throw new RegraNegocioException("Token é obrigatório");
        if (novaSenha == null || novaSenha.length() < 6) throw new RegraNegocioException("Nova senha deve ter pelo menos 6 caracteres");

        PasswordResetToken reset = resetTokenRepository.findByTokenAndUsadoFalse(token.trim().toUpperCase())
                .orElseThrow(() -> new RegraNegocioException("Token inválido"));

        if (reset.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new RegraNegocioException("Token expirado");
        }

        Usuario usuario = reset.getUsuario();
        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        reset.setUsado(true);
        resetTokenRepository.save(reset);

        logService.registrar("RESET_PASSWORD", "usuarios", usuario, null,
                "{\"email\":\"" + usuario.getEmail() + "\"}", request);
        return new MensagemResponseDTO("Senha atualizada");
    }

    private void validarCadastro(UsuarioDTO dto) {
        if (dto == null) throw new RegraNegocioException("Dados do usuário são obrigatórios");
        if (dto.getNome() == null || dto.getNome().isBlank()) throw new RegraNegocioException("Nome é obrigatório");
        if (dto.getEmail() == null || dto.getEmail().isBlank()) throw new RegraNegocioException("Email é obrigatório");
        if (!dto.getEmail().contains("@")) throw new RegraNegocioException("Email inválido");
        if (dto.getSenha() == null || dto.getSenha().length() < 6) throw new RegraNegocioException("Senha deve ter pelo menos 6 caracteres");
    }

    private String gerarTokenCurto() {
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder token = new StringBuilder();
        String caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ2346789";
        for (int i = 0; i < 6; i++) token.append(caracteres.charAt(random.nextInt(caracteres.length())));
        return token.toString();
    }
}
