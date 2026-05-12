package com.ong.divas.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ong.divas.dto.AgendamentoDTO;
import com.ong.divas.dto.EventoDivaDTO;
import com.ong.divas.entities.Agendamento;
import com.ong.divas.entities.EventoDiva;
import com.ong.divas.entities.Localidade;
import com.ong.divas.entities.Usuario;
import com.ong.divas.enums.TipoUsuario;
import com.ong.divas.exceptions.AcessoNegadoException;
import com.ong.divas.exceptions.NaoEncontradoException;
import com.ong.divas.exceptions.RegraNegocioException;
import com.ong.divas.repository.AgendamentoRepository;
import com.ong.divas.repository.EventoDivaRepository;
import com.ong.divas.repository.LocalidadeRepository;
import com.ong.divas.repository.UsuarioRepository;

@Service
public class EventoDivaService {

    @Autowired
    private EventoDivaRepository eventoRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LocalidadeRepository localidadeRepository;

    public EventoDivaDTO criarEventoPublico(EventoDiva evento, Usuario adminAutenticado) {
        validarEvento(evento);

        if (adminAutenticado.getTipoUsuario() != TipoUsuario.administrador) {
            throw new AcessoNegadoException("Somente administrador pode criar evento público");
        }

        Localidade localidade = localidadeRepository.findById(evento.getLocalidade().getIdLocal())
                .orElseThrow(() -> new NaoEncontradoException("Localidade não encontrada"));

        evento.setUsuario(adminAutenticado);
        evento.setLocalidade(localidade);
        if (evento.getStatus() == null || evento.getStatus().isBlank()) evento.setStatus("confirmado");

        return new EventoDivaDTO(eventoRepository.save(evento));
    }

    public List<EventoDivaDTO> listarEventosPublicos() {
        return eventoRepository.findAll().stream().map(EventoDivaDTO::new).toList();
    }

    public EventoDivaDTO buscarEventoPublico(Long id) {
        return new EventoDivaDTO(buscarEntidade(id));
    }

    public EventoDivaDTO atualizarEventoPublico(Long id, EventoDiva novo, Usuario adminAutenticado) {
        if (adminAutenticado.getTipoUsuario() != TipoUsuario.administrador) {
            throw new AcessoNegadoException("Somente administrador pode alterar evento público");
        }

        EventoDiva evento = buscarEntidade(id);

        if (novo.getLocalidade() != null && novo.getLocalidade().getIdLocal() != null) {
            Localidade localidade = localidadeRepository.findById(novo.getLocalidade().getIdLocal())
                    .orElseThrow(() -> new NaoEncontradoException("Localidade não encontrada"));
            evento.setLocalidade(localidade);
        }

        if (novo.getTipoEvento() != null && !novo.getTipoEvento().isBlank()) evento.setTipoEvento(novo.getTipoEvento());
        if (novo.getTitulo() != null && !novo.getTitulo().isBlank()) evento.setTitulo(novo.getTitulo());
        if (novo.getDescricao() != null) evento.setDescricao(novo.getDescricao());
        if (novo.getDataInicio() != null) evento.setDataInicio(novo.getDataInicio());
        if (novo.getDataFim() != null) evento.setDataFim(novo.getDataFim());
        if (novo.getStatus() != null) evento.setStatus(novo.getStatus());

        validarDatas(evento.getDataInicio(), evento.getDataFim());
        return new EventoDivaDTO(eventoRepository.save(evento));
    }

    public void deletarEventoPublico(Long id, Usuario adminAutenticado) {
        if (adminAutenticado.getTipoUsuario() != TipoUsuario.administrador) {
            throw new AcessoNegadoException("Somente administrador pode deletar evento público");
        }
        if (!eventoRepository.existsById(id)) throw new NaoEncontradoException("Evento público não encontrado");
        eventoRepository.deleteById(id);
    }

    public AgendamentoDTO salvarEventoNaAgendaDaBeneficiaria(Long idEvento, Long idUsuario, Usuario autenticado) {
        if (autenticado.getTipoUsuario() != TipoUsuario.beneficiaria) {
            throw new AcessoNegadoException("Somente beneficiária pode salvar evento público na agenda");
        }
        if (!autenticado.getIdUsuario().equals(idUsuario)) {
            throw new AcessoNegadoException("Beneficiária só pode salvar evento na própria agenda");
        }

        EventoDiva evento = buscarEntidade(idEvento);
        Usuario beneficiaria = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));

        String marcador = "[EVENTO_PUBLICO_ID:" + idEvento + "]";
        if (agendamentoRepository.existsByUsuarioIdUsuarioAndDescricaoContaining(idUsuario, marcador)) {
            throw new RegraNegocioException("Esse evento público já está salvo na agenda dessa beneficiária");
        }

        Agendamento agendamento = new Agendamento();
        agendamento.setUsuario(beneficiaria);
        agendamento.setLocalidade(evento.getLocalidade());
        agendamento.setTipoEvento("outros");
        agendamento.setDescricao(marcador + " Evento público salvo: " + evento.getTitulo()
                + (evento.getDescricao() != null ? " - " + evento.getDescricao() : ""));
        agendamento.setDataInicio(evento.getDataInicio());
        agendamento.setDataFim(evento.getDataFim());
        agendamento.setStatus("agendado");

        return new AgendamentoDTO(agendamentoRepository.save(agendamento));
    }

    private EventoDiva buscarEntidade(Long id) {
        return eventoRepository.findById(id).orElseThrow(() -> new NaoEncontradoException("Evento público não encontrado"));
    }

    private void validarEvento(EventoDiva evento) {
        if (evento.getLocalidade() == null || evento.getLocalidade().getIdLocal() == null) throw new RegraNegocioException("Localidade é obrigatória");
        if (evento.getTipoEvento() == null || evento.getTipoEvento().isBlank()) throw new RegraNegocioException("Tipo do evento é obrigatório");
        if (evento.getTitulo() == null || evento.getTitulo().isBlank()) throw new RegraNegocioException("Título é obrigatório");
        if (evento.getDataInicio() == null) throw new RegraNegocioException("Data de início é obrigatória");
        validarDatas(evento.getDataInicio(), evento.getDataFim());
    }

    private void validarDatas(LocalDateTime inicio, LocalDateTime fim) {
        if (fim != null && !inicio.isBefore(fim)) throw new RegraNegocioException("Data início deve ser antes da data fim");
    }
}
