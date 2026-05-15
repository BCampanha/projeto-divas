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
  // 6. RENDERIZAÇÃO DOS LEMBRETES
  // ============================================

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

  function renderizarLembretes() {
    if (!timeline) return;
    const lembretes = carregarLembretes();
    timeline.innerHTML = "";
    
    if (lembretes.length === 0) {
      if (msgVazia) {
        msgVazia.style.display = "block";
        timeline.appendChild(msgVazia);
      }
    } else {
      if (msgVazia) msgVazia.style.display = "none";
      lembretes.sort((a, b) => {
        const [hA, mA] = a.horario.split(":").map(Number);
        const [hB, mB] = b.horario.split(":").map(Number);
        return hB * 60 + mB - (hA * 60 + mA);
      });
      lembretes.forEach((lembrete) => {
        timeline.appendChild(criarElementoLembrete(lembrete));
      });
    }
  }

  // Função global para excluir (usada no onclick do HTML)
  window.excluirLembreteGlobal = function (id) {
    if (confirm("Deseja realmente excluir este lembrete?")) {
      excluirLembrete(id);
      renderizarLembretes();
    }
  };

  // ============================================
  // 7. SUBMISSÃO DO FORMULÁRIO
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
        renderizarLembretes();
      }
    });
  }

  // ============================================
  // 8. CARREGAMENTO INICIAL
  // ============================================
  renderizarLembretes();
});

// ============================================
// 9. DATA ATUAL NO TOPO
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

// ============================================
// 10. ATUALIZAR NOME DO USUÁRIO
// ============================================
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