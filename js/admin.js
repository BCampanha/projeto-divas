/* ============================================================
   ADMIN.JS — PAINEL ADMINISTRATIVO
   Gerencia eventos públicos da ONG via API REST.
   Requer: api.js carregado antes deste script.
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  /* ---- Protege a página: somente admin tem acesso ---- */
  if (!Auth.estaLogado()) {
    window.location.href = './index.html';
    return;
  }
  if (!Auth.isAdmin()) {
    alert('Acesso restrito a administradores.');
    window.location.href = './index.html';
    return;
  }

  /* ---- Exibe o nome do admin na sidebar ---- */
  const nomeSidebar = document.getElementById('nome-sidebar');
  const usuario = Auth.getUsuarioLogado();
  if (nomeSidebar && usuario) {
    nomeSidebar.textContent = usuario.nome;
  }

  /* ---- Referências do DOM ---- */
  const form       = document.getElementById('form-publicar-evento');
  const timeline   = document.getElementById('timeline-eventos');
  const buscaInput = document.getElementById('busca-eventos');

  // o select de tipo-evento-input já vem preenchido no HTML

  /* ---- Carrega e exibe os eventos publicados ---- */
  await carregarEventos();

  /* ---- Filtro de busca em tempo real ---- */
  if (buscaInput) {
    buscaInput.addEventListener('input', () => {
      const termo = buscaInput.value.toLowerCase().trim();
      filtrarEventosLocalmente(termo);
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

  /* ---- Submissão do formulário de novo evento ---- */
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data         = document.getElementById('data-input').value;
      const horario      = document.getElementById('horario-input').value;
      const titulo       = document.getElementById('titulo-input').value;
      const facilitadora = document.getElementById('facilitadora-input').value;
      const descricao    = document.getElementById('descricao-input').value;
      const tipoEvento   = document.getElementById('tipo-evento-input')?.value || 'roda-de-conversa';
      const localTexto   = document.getElementById('local-input')?.value?.trim();

      if (!localTexto) {
        alert('Digite o local do evento.');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      try {
        // Cria a localidade no banco com o texto digitado pelo admin
        const localidade = await DivasAPI.criarLocalidade({
          nomeLocal: localTexto,
          endereco: localTexto,
          cidade: 'São Paulo',
          uf: 'SP'
        });

        const payload = {
          localidade: { idLocal: localidade.idLocal },
          tipoEvento: tipoEvento,
          titulo: titulo,
          descricao: encodarFacilitadoraDescricao(facilitadora, descricao),
          dataInicio: dataHoraParaISO(data, horario),
          dataFim: dataHoraParaISO(data, horario.split(':').map((v, i) =>
            i === 0 ? String((parseInt(v) + 2) % 24).padStart(2, '0') : v
          ).join(':')),
          online: false,
          status: 'confirmado'
        };

        await DivasAPI.criarEvento(payload);

        alert('Evento publicado com sucesso! ✅');
        form.reset();
        await carregarEventos();

      } catch (err) {
        alert('Erro ao publicar evento: ' + err.message);
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }
});

/* ----------------------------------------------------------
   POPULA O SELECT DE LOCALIDADES
   ---------------------------------------------------------- */
async function popularLocaisSelect() {
  const select = document.getElementById('local-input');
  if (!select) return;

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
   CARREGA E RENDERIZA OS EVENTOS (busca da API)
   Armazena os eventos em memória para o filtro local.
   ---------------------------------------------------------- */
let _eventosCache = []; // cache em memória para filtro sem re-fetch

async function carregarEventos() {
  const timeline   = document.getElementById('timeline-eventos');
  const buscaInput = document.getElementById('busca-eventos');
  if (!timeline) return;

  timeline.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px;">Carregando eventos...</p>';

  try {
    // GET /eventos-divas — retorna lista de EventoDivaDTO
    _eventosCache = await DivasAPI.listarEventos() || [];

    const termo = buscaInput ? buscaInput.value.toLowerCase().trim() : '';
    filtrarEventosLocalmente(termo);

  } catch (err) {
    timeline.innerHTML = `<p style="text-align:center;color:#c00;padding:40px;">
      Erro ao carregar eventos: ${err.message}
    </p>`;
    console.error('carregarEventos:', err);
  }
}

/* ----------------------------------------------------------
   FILTRO LOCAL (sobre o cache) + RENDERIZAÇÃO
   ---------------------------------------------------------- */
function filtrarEventosLocalmente(termoBusca = '') {
  const timeline = document.getElementById('timeline-eventos');
  if (!timeline) return;

  let eventos = [..._eventosCache];

  // Ordena por dataInicio do mais recente para o mais antigo (visão do admin)
  eventos.sort((a, b) => {
    const toMs = dt => Array.isArray(dt)
      ? new Date(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0).getTime()
      : new Date(dt).getTime();
    return toMs(b.dataInicio) - toMs(a.dataInicio);
  });

  if (termoBusca) {
    eventos = eventos.filter(ev => {
      const { facilitadora } = decodarFacilitadoraDescricao(ev.descricao);
      const { data, horario } = ISOParaDataHora(ev.dataInicio);
      return (
        ev.titulo?.toLowerCase().includes(termoBusca) ||
        facilitadora.toLowerCase().includes(termoBusca) ||
        data.includes(termoBusca) ||
        horario.includes(termoBusca)
      );
    });
  }

  if (eventos.length === 0) {
    timeline.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">
      ${termoBusca
        ? `Nenhum evento encontrado para "${termoBusca}"`
        : 'Nenhum evento publicado ainda.'}
    </p>`;
    return;
  }

  renderizarEventos(eventos, timeline);
}

/* ----------------------------------------------------------
   CRIA O HTML DOS CARDS DE EVENTOS
   ---------------------------------------------------------- */
function renderizarEventos(eventos, timeline) {
  const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

  timeline.innerHTML = eventos.map(evento => {
    // Converte ISO → dia/mes para exibição lateral
    const { data, horario } = ISOParaDataHora(evento.dataInicio);
    const [dia, mes] = data.split('/');
    const mesNome = meses[parseInt(mes) - 1];

    // Recupera facilitadora codificada na descrição
    const { facilitadora, descricao } = decodarFacilitadoraDescricao(evento.descricao);

    return `
      <div class="lembrete-item">
        <div class="data-lateral">
          <span class="dia">${dia}</span>
          <span class="mes">${mesNome}</span>
        </div>
        <div class="card-lembrete">
          <div class="card-header">
            <div>
              <span class="card-hora">${horario}</span>
              <h3 class="card-titulo">${evento.titulo}</h3>
            </div>
            <div style="display:flex;align-items:center;gap:15px;">
              <span class="etiqueta evento">EVENTO ONG</span>
              <button class="btn-excluir-inline"
                onclick="excluirEventoGlobal(${evento.idEvento})"
                title="Excluir evento">
                <img src="./images/icone-15.png" alt="Excluir">
              </button>
            </div>
          </div>
          ${facilitadora ? `<p class="card-descricao">Facilitadora: ${facilitadora}</p>` : ''}
          ${descricao ? `<p class="card-descricao" style="margin-top:10px;padding-top:10px;border-top:1px solid #f0e6ed;">${descricao}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/* ----------------------------------------------------------
   EXCLUIR EVENTO (chamado pelo onclick inline dos cards)
   ---------------------------------------------------------- */
window.excluirEventoGlobal = async function(id) {
  if (!confirm('Deseja realmente excluir este evento?')) return;
  try {
    // DELETE /eventos-divas/{id}
    await DivasAPI.excluirEvento(id);
    // Remove do cache local e re-renderiza sem nova requisição
    _eventosCache = _eventosCache.filter(e => e.idEvento !== id);
    const buscaInput = document.getElementById('busca-eventos');
    filtrarEventosLocalmente(buscaInput ? buscaInput.value.toLowerCase().trim() : '');
    alert('Evento excluído com sucesso! ✅');
  } catch (err) {
    alert('Erro ao excluir: ' + err.message);
  }
};
