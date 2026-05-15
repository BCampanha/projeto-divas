/* ============================================
   INTERAÇÕES DO SITE - PROJETO DIVAS
   Arquivo: interacoes.js
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  
  // 🔒 Protege a página
  protegerPagina();
  
  // Atualiza data no topo
  atualizarDataTopo();
  
  // Atualiza nome do usuário na sidebar
  atualizarNomeUsuario();
  
  // ============================================
  // 1. MÁSCARA DE DATA (DD/MM/AAAA)
  // ============================================
  const dataInput = document.getElementById("data-input");
  if (dataInput) {
    dataInput.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "");
      if (valor.length > 8) valor = valor.slice(0, 8);
      if (valor.length > 2 && valor.length <= 4) {
        valor = valor.slice(0, 2) + "/" + valor.slice(2);
      } else if (valor.length > 4) {
        valor = valor.slice(0, 2) + "/" + valor.slice(2, 4) + "/" + valor.slice(4);
      }
      e.target.value = valor;
    });
  }

  // ============================================
  // 2. MÁSCARA DE HORÁRIO (HH:MM)
  // ============================================
  const horarioInput = document.getElementById("horario-input");
  if (horarioInput) {
    horarioInput.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "");
      if (valor.length > 4) valor = valor.slice(0, 4);
      if (valor.length > 2) {
        valor = valor.slice(0, 2) + ":" + valor.slice(2);
      }
      e.target.value = valor;
    });
    horarioInput.addEventListener("blur", function (e) {
      const valor = e.target.value;
      const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (valor && !regexHora.test(valor)) {
        e.target.value = "";
        alert("Por favor, insira um horário válido (ex: 14:30)");
      }
    });
  }

  // ============================================
  // 3. SELEÇÃO DE ETIQUETAS
  // ============================================
  const botoesEtiqueta = document.querySelectorAll(".etiqueta-btn");
  let etiquetaSelecionada = null;
  botoesEtiqueta.forEach((btn) => {
    btn.addEventListener("click", () => {
      botoesEtiqueta.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      etiquetaSelecionada = btn.dataset.tag;
    });
  });

  // ============================================
  // 4. CONFIGURAÇÃO DOS LEMBRETES
  // ============================================
  const formulario = document.getElementById("form-lembrete");
  const timeline = document.getElementById("timeline-lembretes");
  const msgVazia = document.querySelector(".mensagem-vazia");

  const configEtiquetas = {
    medicacao: { icone: "./images/icone-17.png", classe: "medicacao", label: "MEDICAÇÃO" },
    consulta: { icone: "./images/icone-18.png", classe: "consulta", label: "CONSULTA" },
    exame: { icone: "./images/icone-19.png", classe: "exame", label: "EXAME" },
    evento: { icone: "./images/icone-20.png", classe: "evento", label: "EVENTO ONG" },
  };

  // ============================================
  // 5. FUNÇÕES DE ARMAZENAMENTO (POR USUÁRIO)
  // ============================================

  function carregarLembretes() {
    const usuario = AuthMock.getUsuarioLogado();
    if (!usuario) return [];
    return AuthMock.getLembretesUsuario(usuario.id);
  }

  function salvarLembrete(novoLembrete) {
    const usuario = AuthMock.getUsuarioLogado();
    if (!usuario) return false;
    AuthMock.adicionarLembrete(usuario.id, novoLembrete);
    return true;
  }

  function excluirLembrete(id) {
    const usuario = AuthMock.getUsuarioLogado();
    if (!usuario) return false;
    AuthMock.excluirLembrete(usuario.id, id);
    return true;
  }

  // ============================================
  // 6. CRIAÇÃO DOS ELEMENTOS (LEMBRETES + EVENTOS)
  // ============================================

  // ✅ FUNÇÃO ORIGINAL - Cria card de lembrete pessoal
  function criarElementoLembrete(lembrete) {
    const config = configEtiquetas[lembrete.etiqueta];
    const elemento = document.createElement("div");
    elemento.classList.add("lembrete-item");
    elemento.dataset.id = lembrete.id;

    elemento.innerHTML = `
      <div class="icone-timeline ${config.classe}">
        <img src="${config.icone}" alt="${config.label}">
      </div>
      <div class="card-lembrete">
        <div class="card-header">
          <span class="card-hora">${lembrete.horario}</span>
          <span class="etiqueta ${config.classe}">${config.label}</span>
        </div>
        <h3 class="card-titulo">${lembrete.titulo}</h3>
        <p class="card-descricao">${lembrete.descricao}</p>
        <small class="card-data">
          <img src="./images/icone-16.png" alt=""> ${lembrete.data}
        </small>
        <button class="btn-excluir" onclick="excluirLembreteGlobal('${lembrete.id}')">
          <img src="./images/icone-15.png" alt="Excluir"> Excluir
        </button>
      </div>
    `;
    return elemento;
  }

  // ✅ NOVA FUNÇÃO - Cria card de evento da ONG
  function criarElementoEvento(evento) {
    const elemento = document.createElement("div");
    elemento.classList.add("lembrete-item");
    elemento.dataset.id = evento.id;
    
    elemento.innerHTML = `
      <div class="icone-timeline evento-ong">
        <img src="./images/icone-20.png" alt="Evento ONG">
      </div>
      <div class="card-lembrete">
        <div class="card-header">
          <span class="card-hora">${evento.horario}</span>
          <span class="etiqueta evento">EVENTO ONG</span>
        </div>
        <h3 class="card-titulo">${evento.titulo}</h3>
        <p class="card-descricao">Facilitadora: ${evento.facilitadora}</p>
        ${evento.descricao ? `<p class="card-descricao" style="margin-top: 5px;">${evento.descricao}</p>` : ''}
        <small class="card-data">
          <img src="./images/icone-16.png" alt=""> ${evento.data}
        </small>
      </div>
    `;
    return elemento;
  }

  // ============================================
  // 7. RENDERIZAÇÃO COMBINADA (LEMBRETES + EVENTOS)
  // ============================================

  function renderizarTudo() {
    if (!timeline) return;

    const lembretes = carregarLembretes();
    const eventosPublicos = JSON.parse(localStorage.getItem('eventosPublicos') || '[]');
    
    const todosItems = [
      ...lembretes.map(l => ({ ...l, tipo: 'pessoal' })),
      ...eventosPublicos.map(e => ({ ...e, tipo: 'evento-ong' }))
    ];

    // Limpa a timeline
    timeline.innerHTML = "";

    if (todosItems.length === 0) {
      if (msgVazia) {
        msgVazia.style.display = "block";
        timeline.appendChild(msgVazia);
      }
    } else {
      if (msgVazia) msgVazia.style.display = "none";
      
      // ✅ LÓGICA DE ORDENAÇÃO PERFEITA (Data Crescente + Horário Crescente)
      todosItems.sort((a, b) => {
        // 1. Separa Dia, Mês e Ano
        const [diaA, mesA, anoA] = a.data.split('/').map(Number);
        const [horaA, minA] = a.horario.split(':').map(Number);
        
        const [diaB, mesB, anoB] = b.data.split('/').map(Number);
        const [horaB, minB] = b.horario.split(':').map(Number);

        // 2. Cria um objeto Date completo para cada item
        // Nota: O mês no JavaScript começa em 0 (Janeiro = 0), por isso o "-1"
        const dataCompletaA = new Date(anoA, mesA - 1, diaA, horaA, minA);
        const dataCompletaB = new Date(anoB, mesB - 1, diaB, horaB, minB);

        // 3. Compara os dois momentos
        // Se a diferença for negativa, A é anterior a B (vem primeiro)
        return dataCompletaA - dataCompletaB;
      });

      // Desenha cada item na ordem certa
      todosItems.forEach(item => {
        if (item.tipo === 'pessoal') {
          timeline.appendChild(criarElementoLembrete(item));
        } else {
          timeline.appendChild(criarElementoEvento(item));
        }
      });
    }
  }

// ============================================
  // FUNÇÃO GLOBAL DE EXCLUSÃO
  // ============================================
  window.excluirLembreteGlobal = function(id) {
    if (confirm("Deseja realmente excluir este lembrete?")) {
      excluirLembrete(id);
      renderizarTudo();
    }
  };

  // ============================================
  // 8. SUBMISSÃO DO FORMULÁRIO
  // ============================================
  if (formulario && timeline) {
    formulario.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!etiquetaSelecionada) {
        alert("Por favor, selecione uma etiqueta (Medicação, Consulta, etc).");
        return;
      }
      const data = document.getElementById("data-input")?.value || "";
      const horario = document.getElementById("horario-input")?.value || "";
      const titulo = document.getElementById("titulo-input")?.value || "";
      const descricao = document.getElementById("descricao-input")?.value || "";

      const novoLembrete = {
        data,
        horario,
        titulo,
        descricao,
        etiqueta: etiquetaSelecionada,
      };

      if (salvarLembrete(novoLembrete)) {
        formulario.reset();
        botoesEtiqueta.forEach((b) => b.classList.remove("active"));
        etiquetaSelecionada = null;
        renderizarTudo();
      }
    });
  }

  // ============================================
  // 9. CARREGAMENTO INICIAL
  // ============================================
  renderizarTudo();
  
  // Atualiza automaticamente se evento for publicado em outra aba
  window.addEventListener('storage', (e) => {
    if (e.key === 'eventosPublicos') {
      renderizarTudo();
    }
  });
});

// ============================================
// 10. FUNÇÕES GLOBAIS (FORA DO DOMContentLoaded)
// ============================================

function atualizarDataTopo() {
  const dataHoje = new Date();
  const meses = ["Jan", "Fev", "Mar", "Abr", "Maio", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const diaSemana = diasSemana[dataHoje.getDay()];
  const dia = dataHoje.getDate();
  const mes = meses[dataHoje.getMonth()];
  const ano = dataHoje.getFullYear();
  const textoData = `${diaSemana}, ${dia} de ${mes} <br/> ${ano}`;
  const spanData = document.getElementById('data-atual');
  if (spanData) spanData.innerHTML = textoData;
}

function atualizarNomeUsuario() {
  const usuario = AuthMock.getUsuarioLogado();
  if (!usuario) return;
  
  const nomeSpan = document.getElementById('nome-paciente');
  if (nomeSpan) nomeSpan.textContent = usuario.nome.split(' ')[0];
  
  const sidebarNome = document.getElementById('nome-sidebar');
  if (sidebarNome) sidebarNome.textContent = usuario.nome;
}

// ============================================
// 11. BOTÃO DE PERFIL ATIVO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const perfilBtn = document.querySelector('.perfil');
  if (window.location.href.includes('perfil.html') && perfilBtn) {
    perfilBtn.classList.add('active');
  }
  const btnInicio = document.querySelector('a[href*="agenda.html"]') || document.querySelector('a[href="."]');
  if (window.location.href.includes('agenda.html') || window.location.href.includes('index.html')) {
    if(btnInicio) btnInicio.classList.add('active');
  }
});