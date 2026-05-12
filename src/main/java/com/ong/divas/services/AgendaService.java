package com.ong.divas.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ong.divas.dto.AgendamentoDTO;
import com.ong.divas.entities.Agendamento;
import com.ong.divas.entities.Localidade;
import com.ong.divas.entities.Usuario;
import com.ong.divas.enums.TipoUsuario;
import com.ong.divas.exceptions.AcessoNegadoException;
import com.ong.divas.exceptions.NaoEncontradoException;
import com.ong.divas.exceptions.RegraNegocioException;
import com.ong.divas.repository.AgendamentoRepository;
import com.ong.divas.repository.LocalidadeRepository;
import com.ong.divas.repository.UsuarioRepository;

@Service
public class AgendaService {

    @Autowired
    private AgendamentoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LocalidadeRepository localidadeRepository;

    public AgendamentoDTO criar(Agendamento agendamento, Usuario autenticado) {
        validarAgendamento(agendamento);

        Long idUsuarioDestino = agendamento.getUsuario().getIdUsuario();
        if (autenticado.getTipoUsuario() == TipoUsuario.beneficiaria && !autenticado.getIdUsuario().equals(idUsuarioDestino)) {
            throw new AcessoNegadoException("Beneficiária só pode criar eventos na própria agenda");
        }

        Usuario usuario = usuarioRepository.findById(idUsuarioDestino)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        if (usuario.getTipoUsuario() != TipoUsuario.beneficiaria) {
            throw new RegraNegocioException("Eventos pessoais só podem ser criados para beneficiárias");
        }

        Localidade localidade = localidadeRepository.findById(agendamento.getLocalidade().getIdLocal())
                .orElseThrow(() -> new NaoEncontradoException("Localidade não encontrada"));

        validarDatas(agendamento.getDataInicio(), agendamento.getDataFim());
        validarConflito(usuario.getIdUsuario(), agendamento.getDataInicio(), agendamento.getDataFim());

        agendamento.setUsuario(usuario);
        agendamento.setLocalidade(localidade);
        if (agendamento.getStatus() == null || agendamento.getStatus().isBlank()) agendamento.setStatus("agendado");

        return new AgendamentoDTO(repository.save(agendamento));
    }

    public List<AgendamentoDTO> listar(Usuario autenticado) {
        if (autenticado.getTipoUsuario() == TipoUsuario.administrador) {
            return repository.findAll().stream().map(AgendamentoDTO::new).toList();
        }
        return repository.findByUsuarioIdUsuario(autenticado.getIdUsuario()).stream().map(AgendamentoDTO::new).toList();
    }

    public List<AgendamentoDTO> listarPorUsuario(Long idUsuario, Usuario autenticado) {
        if (autenticado.getTipoUsuario() != TipoUsuario.administrador && !autenticado.getIdUsuario().equals(idUsuario)) {
            throw new AcessoNegadoException("Beneficiária só pode ver a própria agenda");
        }
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
        return repository.findByUsuarioIdUsuario(usuario.getIdUsuario()).stream().map(AgendamentoDTO::new).toList();
    }

    public AgendamentoDTO buscarPorId(Long id, Usuario autenticado) {
        Agendamento agendamento = buscarEntidade(id);
        validarDonoOuAdmin(agendamento, autenticado);
        return new AgendamentoDTO(agendamento);
    }

    public AgendamentoDTO atualizar(Long id, Agendamento novo, Usuario autenticado) {
        Agendamento agendamento = buscarEntidade(id);
        validarDonoOuAdmin(agendamento, autenticado);

        if (novo.getLocalidade() != null && novo.getLocalidade().getIdLocal() != null) {
            Localidade localidade = localidadeRepository.findById(novo.getLocalidade().getIdLocal())
                    .orElseThrow(() -> new NaoEncontradoException("Localidade não encontrada"));
            agendamento.setLocalidade(localidade);
        }

        if (novo.getTipoEvento() != null && !novo.getTipoEvento().isBlank()) agendamento.setTipoEvento(novo.getTipoEvento());
        if (novo.getDescricao() != null) agendamento.setDescricao(novo.getDescricao());
        if (novo.getDataInicio() != null) agendamento.setDataInicio(novo.getDataInicio());
        if (novo.getDataFim() != null) agendamento.setDataFim(novo.getDataFim());
        if (novo.getStatus() != null) agendamento.setStatus(novo.getStatus());

        validarDatas(agendamento.getDataInicio(), agendamento.getDataFim());
        return new AgendamentoDTO(repository.save(agendamento));
    }

    public void deletar(Long id, Usuario autenticado) {
        Agendamento agendamento = buscarEntidade(id);
        validarDonoOuAdmin(agendamento, autenticado);
        repository.deleteById(id);
    }

    public List<AgendamentoDTO> filtrar(Long usuarioId, LocalDate data, Usuario autenticado) {
        Long usuarioFiltro = usuarioId;
        if (autenticado.getTipoUsuario() == TipoUsuario.beneficiaria) {
            if (usuarioId != null && !autenticado.getIdUsuario().equals(usuarioId)) {
                throw new AcessoNegadoException("Beneficiária só pode filtrar a própria agenda");
            }
            usuarioFiltro = autenticado.getIdUsuario();
        }
        return repository.filtrar(usuarioFiltro, data).stream().map(AgendamentoDTO::new).toList();
    }

    private Agendamento buscarEntidade(Long id) {
        return repository.findById(id).orElseThrow(() -> new NaoEncontradoException("Agendamento não encontrado"));
    }

    private void validarDonoOuAdmin(Agendamento agendamento, Usuario autenticado) {
        if (autenticado.getTipoUsuario() != TipoUsuario.administrador
                && !agendamento.getUsuario().getIdUsuario().equals(autenticado.getIdUsuario())) {
            throw new AcessoNegadoException("Beneficiária só pode acessar a própria agenda");
        }
    }

    private void validarAgendamento(Agendamento agendamento) {
        if (agendamento.getUsuario() == null || agendamento.getUsuario().getIdUsuario() == null) throw new RegraNegocioException("Usuário é obrigatório");
        if (agendamento.getLocalidade() == null || agendamento.getLocalidade().getIdLocal() == null) throw new RegraNegocioException("Localidade é obrigatória");
        if (agendamento.getTipoEvento() == null || agendamento.getTipoEvento().isBlank()) throw new RegraNegocioException("Tipo do evento é obrigatório");
        if (agendamento.getDataInicio() == null) throw new RegraNegocioException("Data de início é obrigatória");
    }

    private void validarDatas(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio == null) throw new RegraNegocioException("Data de início é obrigatória");
        if (fim != null && !inicio.isBefore(fim)) throw new RegraNegocioException("Data início deve ser antes da data fim");
    }

    private void validarConflito(Long usuarioId, LocalDateTime inicio, LocalDateTime fim) {
        if (fim != null && !repository.verificarConflito(usuarioId, inicio, fim).isEmpty()) {
            throw new RegraNegocioException("Já existe um agendamento nesse horário para esse usuário");
        }
    }
}
