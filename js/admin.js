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

// ✅ FUNÇÃO DE RENDERIZAÇÃO
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
            <span class="card-hora">${evento.horario}</span>
            <span class="etiqueta evento">EVENTO ONG</span>
          </div>
          <h3 class="card-titulo">${evento.titulo}</h3>
          <p class="card-descricao">Sessão presencial<br>Facilitadora: ${evento.facilitadora}</p>
        </div>
      </div>
    `;
  }).join('');
}

// ✅ FUNÇÃO PRINCIPAL
function carregarEventos() {
  const buscaInput = document.getElementById('busca-eventos');
  const termoBusca = buscaInput ? buscaInput.value.toLowerCase().trim() : '';
  filtrarEventos(termoBusca);
}