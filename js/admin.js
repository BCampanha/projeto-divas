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
  
  // Carregar eventos publicados
  carregarEventos();

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

      // Salva no localStorage (eventos públicos)
      const eventos = JSON.parse(localStorage.getItem('eventosPublicos') || '[]');
      eventos.push(novoEvento);
      localStorage.setItem('eventosPublicos', JSON.stringify(eventos));

      alert('Evento publicado com sucesso! ✅');
      form.reset();
      carregarEventos();
    });
  }
});

function carregarEventos() {
  const timeline = document.getElementById('timeline-eventos');
  if (!timeline) return;

  const eventos = JSON.parse(localStorage.getItem('eventosPublicos') || '[]');
  
  if (eventos.length === 0) {
    timeline.innerHTML = '<p style="text-align: center; color: #999;">Nenhum evento publicado ainda.</p>';
    return;
  }

  // Ordena por data
  eventos.sort((a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm));

  timeline.innerHTML = eventos.map(evento => `
    <div class="lembrete-item">
      <div class="data-lateral">
        <span class="dia">${evento.data.split('/')[0]}</span>
        <span class="mes">ABR</span>
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
  `).join('');
}