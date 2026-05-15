// js/admin.js
document.addEventListener('DOMContentLoaded', () => {
  // Protege a página (só admin acessa)
  const usuario = AuthMock.getUsuarioLogado();
  if (usuario) {
    const nomeSidebar = document.getElementById('nome-sidebar');
    if (nomeSidebar) {
      nomeSidebar.textContent = usuario.nome;
    }
  }

  if (!AuthMock.isAdmin()) {
    window.location.href = './index.html';
    return;
  }

  const form = document.getElementById('form-publicar-evento');
  const timeline = document.getElementById('timeline-eventos');
  
  // ✅ DECLARA A VARIÁVEL DO INPUT DE BUSCA
  const buscaInput = document.getElementById('busca-eventos');
  
  // Carregar eventos publicados
  carregarEventos();

  // ✅ FILTRO DE BUSCA
  if (buscaInput) {
    buscaInput.addEventListener('input', (e) => {
      const termoBusca = e.target.value.toLowerCase().trim();
      filtrarEventos(termoBusca);
    });
  }

  // Publicar novo evento
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const data = document.getElementById('data-input').value;
      const horario = document.getElementById('horario-input').value;
      const titulo = document.getElementById('titulo-input').value;
      const facilitadora = document.getElementById('facilitadora-input').value;
      const descricao = document.getElementById('descricao-input').value;

      const novoEvento = {
        id: Date.now().toString(),
        data,
        horario,
        titulo,
        facilitadora,
        descricao,
        publicadoEm: new Date().toISOString(),
        tipo: 'evento-ong'
      };

      const eventos = JSON.parse(localStorage.getItem('eventosPublicos') || '[]');
      eventos.push(novoEvento);
      localStorage.setItem('eventosPublicos', JSON.stringify(eventos));

      alert('Evento publicado com sucesso! ✅');
      form.reset();
      carregarEventos();
    });
  }
});

// ============================================
  // MÁSCARA DE HORÁRIO (HH:MM)
  // ============================================
  const horarioInput = document.getElementById("horario-input");
  if (horarioInput) {
    horarioInput.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
      if (valor.length > 4) valor = valor.slice(0, 4);
      
      if (valor.length > 2) {
        valor = valor.slice(0, 2) + ":" + valor.slice(2);
      }
      
      e.target.value = valor;
    });

    // Validação ao sair do campo
    horarioInput.addEventListener("blur", function (e) {
      const valor = e.target.value;
      const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
      
      if (valor && !regexHora.test(valor)) {
        alert("Por favor, insira um horário válido (ex: 14:30)");
        e.target.value = "";
      }
    });
  }

// ✅ FUNÇÃO DE FILTRAGEM
function filtrarEventos(termoBusca = '') {
  const timeline = document.getElementById('timeline-eventos');
  if (!timeline) return;

  let eventos = JSON.parse(localStorage.getItem('eventosPublicos') || '[]');
  
  // Ordena por data de publicação (mais recente primeiro)
  eventos.sort((a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm));

  // Filtra se houver termo de busca
  if (termoBusca) {
    eventos = eventos.filter(evento => {
      const tituloMatch = evento.titulo.toLowerCase().includes(termoBusca);
      const facilitadoraMatch = evento.facilitadora.toLowerCase().includes(termoBusca);
      const dataMatch = evento.data.includes(termoBusca);
      const horarioMatch = evento.horario.includes(termoBusca);
      
      return tituloMatch || facilitadoraMatch || dataMatch || horarioMatch;
    });
  }

  if (eventos.length === 0) {
    timeline.innerHTML = `<p style="text-align: center; color: #999; padding: 40px;">
      ${termoBusca ? 'Nenhum evento encontrado para "' + termoBusca + '"' : 'Nenhum evento publicado ainda.'}
    </p>`;
    return;
  }

  renderizarEventos(eventos, timeline);
}

// ✅ FUNÇÃO DE RENDERIZAÇÃO (COM BOTÃO DE EXCLUIR E DESCRIÇÃO)
function renderizarEventos(eventos, timeline) {
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  timeline.innerHTML = eventos.map(evento => {
    const dataParts = evento.data.split('/');
    const dia = dataParts[0];
    const mes = dataParts[1];
    const mesNome = meses[parseInt(mes) - 1];

    return `
      <div class="lembrete-item">
        <div class="data-lateral">
          <span class="dia">${dia}</span>
          <span class="mes">${mesNome}</span>
        </div>
        <div class="card-lembrete">
          <div class="card-header">
            <div>
              <span class="card-hora">${evento.horario}</span>
              <h3 class="card-titulo">${evento.titulo}</h3>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span class="etiqueta evento">EVENTO ONG</span>
              <button class="btn-excluir-inline" onclick="excluirEventoGlobal('${evento.id}')" title="Excluir evento">
                <img src="./images/icone-15.png" alt="Excluir">
              </button>
            </div>
          </div>
          <p class="card-descricao">Sessão presencial<br>Facilitadora: ${evento.facilitadora}</p>
          ${evento.descricao ? `<p class="card-descricao" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0e6ed;">${evento.descricao}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ✅ FUNÇÃO GLOBAL PARA EXCLUIR EVENTO
window.excluirEventoGlobal = function(id) {
  if (confirm('Deseja realmente excluir este evento?')) {
    let eventos = JSON.parse(localStorage.getItem('eventosPublicos') || '[]');
    eventos = eventos.filter(e => e.id !== id);
    localStorage.setItem('eventosPublicos', JSON.stringify(eventos));
    
    // Recarrega a lista
    const buscaInput = document.getElementById('busca-eventos');
    const termoBusca = buscaInput ? buscaInput.value.toLowerCase().trim() : '';
    filtrarEventos(termoBusca);
    
    alert('Evento excluído com sucesso! ✅');
  }
};

// ✅ FUNÇÃO PRINCIPAL
function carregarEventos() {
  const buscaInput = document.getElementById('busca-eventos');
  const termoBusca = buscaInput ? buscaInput.value.toLowerCase().trim() : '';
  filtrarEventos(termoBusca);
}