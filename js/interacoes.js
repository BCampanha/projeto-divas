/* ============================================================
   INTERACOES.JS — AGENDA DA BENEFICIÁRIA
   Gerencia lembretes pessoais (agendamentos) e exibe eventos
   públicos da ONG. Todas as operações usam a API REST via api.js.
   Requer: api.js carregado antes deste script.
   ============================================================ */

/* ----------------------------------------------------------
   CONFIGURAÇÃO DAS ETIQUETAS DE LEMBRETE
   Mapeamento entre o tipoEvento do backend e o estilo visual.
   ---------------------------------------------------------- */
const configEtiquetas = {
  medicacao: { icone: './images/icone-17.png', classe: 'medicacao', label: 'MEDICAÇÃO' },
  consulta:  { icone: './images/icone-18.png', classe: 'consulta',  label: 'CONSULTA'  },
  exame:     { icone: './images/icone-19.png', classe: 'exame',     label: 'EXAME'     },
  outros:    { icone: './images/icone-20.png', classe: 'evento',    label: 'OUTROS'    }
};

/* ----------------------------------------------------------
   RENDERIZAÇÃO DE CARDS
   ---------------------------------------------------------- */

// Cria o elemento HTML de um lembrete pessoal (AgendamentoDTO do backend)
function criarElementoLembrete(agendamento) {
  // Decoda o título que foi armazenado dentro do campo descricao
  const { titulo, descricao } = decodarTituloDescricao(agendamento.descricao);

  // Converte dataInicio (ISO / array do Spring) para o formato de exibição
  const { data, horario } = ISOParaDataHora(agendamento.dataInicio);

  // Usa a etiqueta correspondente ao tipoEvento; cai em 'outros' se desconhecido
  const config = configEtiquetas[agendamento.tipoEvento] || configEtiquetas.outros;

  const elemento = document.createElement('div');
  elemento.classList.add('lembrete-item');
  elemento.dataset.id = agendamento.idAgendamento;

  elemento.innerHTML = `
    <div class="icone-timeline ${config.classe}">
      <img src="${config.icone}" alt="${config.label}">
    </div>
    <div class="card-lembrete">
      <div class="card-header">
        <span class="card-hora">${horario}</span>
        <span class="etiqueta ${config.classe}">${config.label}</span>
      </div>
      <h3 class="card-titulo">${titulo}</h3>
      ${descricao ? `<p class="card-descricao">${descricao}</p>` : ''}
      <small class="card-data">
        <img src="./images/icone-16.png" alt=""> ${data}
      </small>
      <button class="btn-excluir" onclick="excluirLembreteGlobal(${agendamento.idAgendamento})">
        <img src="./images/icone-15.png" alt="Excluir"> Excluir
      </button>
    </div>
  `;
  return elemento;
}

// Cria o elemento HTML de um evento público (EventoDivaDTO do backend)
function criarElementoEvento(evento) {
  // Recupera facilitadora e descrição armazenadas juntas no campo descricao
  const { facilitadora, descricao } = decodarFacilitadoraDescricao(evento.descricao);
  const { data, horario } = ISOParaDataHora(evento.dataInicio);

  const usuario = Auth.getUsuarioLogado();

  const elemento = document.createElement('div');
  elemento.classList.add('lembrete-item');
  elemento.dataset.id = evento.idEvento;

  elemento.innerHTML = `
    <div class="icone-timeline evento-ong">
      <img src="./images/icone-20.png" alt="Evento ONG">
    </div>
    <div class="card-lembrete">
      <div class="card-header">
        <span class="card-hora">${horario}</span>
        <span class="etiqueta evento">EVENTO ONG</span>
      </div>
      <h3 class="card-titulo">${evento.titulo}</h3>
      ${facilitadora ? `<p class="card-descricao">Facilitadora: ${facilitadora}</p>` : ''}
      ${descricao ? `<p class="card-descricao" style="margin-top:5px;">${descricao}</p>` : ''}
      <small class="card-data">
        <img src="./images/icone-16.png" alt=""> ${data}
      </small>
      ${usuario
        ? `<button class="btn-salvar-agenda" id="btn-salvar-${evento.idEvento}"
             onclick="salvarEventoNaMinhaAgenda(${evento.idEvento}, ${usuario.id}, this)">
             + Salvar na minha agenda
           </button>`
        : ''}
    </div>
  `;
  return elemento;
}

/* ----------------------------------------------------------
   POPULAR SELECT DE LOCALIDADES
   Chamado no init para preencher o <select id="local-input">
   com as localidades cadastradas no banco via /localidades.
   ---------------------------------------------------------- */
async function popularLocaisSelect(select) {
  try {
    const localidades = await DivasAPI.listarLocalidades();

    if (!localidades || localidades.length === 0) {
      select.innerHTML = '<option value="">Nenhum local cadastrado</option>';
      return;
    }

    select.innerHTML = localidades
      .map(l => `<option value="${l.idLocal}">${l.nomeLocal} — ${l.cidade}/${l.uf}</option>`)
      .join('');

  } catch (err) {
    select.innerHTML = '<option value="">Erro ao carregar locais</option>';
    console.error('Erro ao buscar localidades:', err);
  }
}

/* ----------------------------------------------------------
   RENDERIZAÇÃO COMBINADA
   Busca agendamentos pessoais + eventos públicos em paralelo
   e monta a timeline ordenada por data/hora.
   ---------------------------------------------------------- */
async function renderizarTudo() {
  const timeline = document.getElementById('timeline-lembretes');
  if (!timeline) return; // página não tem timeline (ex: perfil.html)

  const msgVazia = document.querySelector('.mensagem-vazia');
  timeline.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px;">Carregando...</p>';

  try {
    // Busca os dois recursos em paralelo para reduzir tempo de espera
    const [agendamentos, eventos] = await Promise.all([
      DivasAPI.listarAgendamentos(),
      DivasAPI.listarEventos()
    ]);

    // Agendamentos que vieram de "salvar evento público na agenda" têm o
    // marcador [EVENTO_PUBLICO_ID:...] na descrição — descartamos para evitar
    // duplicata com o card do evento público abaixo.
    const agendamentosPessoais = (agendamentos || []).filter(
      a => !a.descricao?.includes('[EVENTO_PUBLICO_ID:')
    );

    // Normaliza ambas as coleções para um formato comum de ordenação
    const lembretes = agendamentosPessoais.map(a => ({ ...a, _tipo: 'pessoal' }));
    const eventosOng  = (eventos || []).map(e => ({ ...e, _tipo: 'evento-ong' }));

    const todosItens = [...lembretes, ...eventosOng];

    timeline.innerHTML = '';

    if (todosItens.length === 0) {
      if (msgVazia) {
        msgVazia.style.display = 'block';
        timeline.appendChild(msgVazia);
      } else {
        timeline.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px;">Nenhum item na agenda.</p>';
      }
      return;
    }

    if (msgVazia) msgVazia.style.display = 'none';

    // Ordena por dataInicio crescente (ISO ou array do Spring, ambos funcionam via Date)
    todosItens.sort((a, b) => {
      const toMs = dt => Array.isArray(dt)
        ? new Date(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0).getTime()
        : new Date(dt).getTime();
      return toMs(a.dataInicio) - toMs(b.dataInicio);
    });

    todosItens.forEach(item => {
      if (item._tipo === 'pessoal') {
        timeline.appendChild(criarElementoLembrete(item));
      } else {
        timeline.appendChild(criarElementoEvento(item));
      }
    });

  } catch (err) {
    timeline.innerHTML = `<p style="text-align:center;color:#c00;padding:40px;">
      Erro ao carregar agenda: ${err.message}
    </p>`;
    console.error('renderizarTudo:', err);
  }
}

/* ----------------------------------------------------------
   AÇÕES GLOBAIS (onclick inline nos cards)
   ---------------------------------------------------------- */

// Exclui um agendamento pessoal (lembrete)
window.excluirLembreteGlobal = async function(id) {
  if (!confirm('Deseja realmente excluir este lembrete?')) return;
  try {
    await DivasAPI.excluirAgendamento(id);
    await renderizarTudo();
  } catch (err) {
    alert('Erro ao excluir: ' + err.message);
  }
};

// Salva um evento público na agenda pessoal da beneficiária
window.salvarEventoNaMinhaAgenda = async function(idEvento, idUsuario, btn) {
  btn.disabled = true;

  try {
    await DivasAPI.salvarEventoNaAgenda(idEvento, idUsuario);
    btn.textContent = '✓ Salvo na agenda!';
    btn.style.background = '#d4edda';
    btn.style.color = '#276749';
    btn.style.cursor = 'default';
  } catch (err) {
    const jaExiste = err.message?.toLowerCase().includes('já');
    if (jaExiste) {
      btn.textContent = '✓ Já está na agenda';
      btn.style.background = '#d4edda';
      btn.style.color = '#276749';
      btn.style.cursor = 'default';
    } else {
      btn.textContent = '+ Salvar na minha agenda';
      btn.disabled = false;
      alert(err.message);
    }
  }
};

/* ----------------------------------------------------------
   FUNÇÕES UTILITÁRIAS DO CABEÇALHO (usadas em várias páginas)
   ---------------------------------------------------------- */

// Exibe a data de hoje no topo da página
function atualizarDataTopo() {
  const dataHoje = new Date();
  const meses = ['Jan','Fev','Mar','Abr','Maio','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const diasSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const texto = `${diasSemana[dataHoje.getDay()]}, ${dataHoje.getDate()} de ${meses[dataHoje.getMonth()]} <br/> ${dataHoje.getFullYear()}`;
  const spanData = document.getElementById('data-atual');
  if (spanData) spanData.innerHTML = texto;
}

// Preenche os campos de nome na interface com os dados da sessão atual
function atualizarNomeUsuario() {
  const usuario = Auth.getUsuarioLogado();
  if (!usuario) return;

  // Primeiro nome na saudação da agenda
  const nomePaciente = document.getElementById('nome-paciente');
  if (nomePaciente) nomePaciente.textContent = usuario.nome.split(' ')[0];

  // Nome completo na sidebar
  const nomeSidebar = document.getElementById('nome-sidebar');
  if (nomeSidebar) nomeSidebar.textContent = usuario.nome;
}

/* ----------------------------------------------------------
   INICIALIZAÇÃO (DOMContentLoaded)
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  // Bloqueia acesso caso não esteja logado
  protegerPagina();

  // Atualiza cabeçalho com data e nome do usuário
  atualizarDataTopo();
  atualizarNomeUsuario();

  /* ---- Máscara de data (DD/MM/AAAA) ---- */
  const dataInput = document.getElementById('data-input');
  if (dataInput) {
    dataInput.addEventListener('input', function(e) {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
      else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
      e.target.value = v;
    });
  }

  /* ---- Máscara de horário (HH:MM) ---- */
  const horarioInput = document.getElementById('horario-input');
  if (horarioInput) {
    horarioInput.addEventListener('input', function(e) {
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + ':' + v.slice(2);
      e.target.value = v;
    });
    horarioInput.addEventListener('blur', function(e) {
      if (e.target.value && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(e.target.value)) {
        alert('Por favor, insira um horário válido (ex: 14:30)');
        e.target.value = '';
      }
    });
  }

  /* ---- Seleção de etiquetas ---- */
  const botoesEtiqueta = document.querySelectorAll('.etiqueta-btn');
  let etiquetaSelecionada = null;
  botoesEtiqueta.forEach(btn => {
    btn.addEventListener('click', () => {
      botoesEtiqueta.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      etiquetaSelecionada = btn.dataset.tag; // 'medicacao', 'consulta', 'exame'
    });
  });

  /* ---- Submissão do formulário de lembrete ---- */
  const formulario = document.getElementById('form-lembrete');
  const timeline   = document.getElementById('timeline-lembretes');

  if (formulario && timeline) {
    formulario.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!etiquetaSelecionada) {
        alert('Por favor, selecione uma etiqueta (Medicação, Consulta, etc).');
        return;
      }

      const data       = document.getElementById('data-input')?.value || '';
      const horario    = document.getElementById('horario-input')?.value || '';
      const titulo     = document.getElementById('titulo-input')?.value || '';
      const descricao  = document.getElementById('descricao-input')?.value || '';
      const localTexto = document.getElementById('local-input')?.value?.trim() || '';

      if (!data || !horario) {
        alert('Selecione uma data e horário.');
        return;
      }
      if (!localTexto) {
        alert('Informe o local do lembrete.');
        return;
      }

      const usuario = Auth.getUsuarioLogado();
      const btn = formulario.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      try {
        // Cria a localidade com o endereço digitado pela paciente
        const localidade = await DivasAPI.criarLocalidade({
          nomeLocal: localTexto,
          endereco: localTexto,
          cidade: 'São Paulo',
          uf: 'SP'
        });

        const payload = {
          usuario: { idUsuario: usuario.id },
          localidade: { idLocal: localidade.idLocal },
          tipoEvento: etiquetaSelecionada,
          descricao: encodarTituloDescricao(titulo, descricao),
          dataInicio: dataHoraParaISO(data, horario),
          dataFim: dataHoraParaISO(data, horario.split(':').map((v, i) =>
            i === 0 ? String((parseInt(v) + 1) % 24).padStart(2, '0') : v
          ).join(':'))
        };

        await DivasAPI.criarAgendamento(payload);
        formulario.reset();
        botoesEtiqueta.forEach(b => b.classList.remove('active'));
        etiquetaSelecionada = null;
        await renderizarTudo();
      } catch (err) {
        alert('Erro ao salvar lembrete: ' + err.message);
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  /* ---- Renderiza agenda ao carregar a página ---- */
  await renderizarTudo();
});

/* ----------------------------------------------------------
   BOTÃO DE NAVEGAÇÃO ATIVO
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const perfilBtn = document.querySelector('.perfil');
  if (window.location.href.includes('perfil.html') && perfilBtn) {
    perfilBtn.classList.add('active');
  }
  const btnInicio = document.querySelector('a[href*="agenda.html"]') || document.querySelector('a[href="."]');
  if ((window.location.href.includes('agenda.html') || window.location.href.includes('index.html')) && btnInicio) {
    btnInicio.classList.add('active');
  }
});
