/* ============================================
   INTERAÇÕES DO SITE - PROJETO DIVAS
   Arquivo: interacoes.js
   ============================================ */

// Aguarda o carregamento total do HTML antes de rodar os scripts
document.addEventListener("DOMContentLoaded", () => {
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
        valor =
          valor.slice(0, 2) + "/" + valor.slice(2, 4) + "/" + valor.slice(4);
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
  // 4. LEMBRETES - VARIÁVEIS E CONFIG
  // ============================================
  const formulario = document.getElementById("form-lembrete");
  const timeline = document.getElementById("timeline-lembretes");
  const msgVazia =
    document.querySelector(".mensagem-vazia") ||
    document.getElementById("msg-vazia");

  const configEtiquetas = {
    medicacao: { icone: "./images/icone-17.png", classe: "medicacao", label: "MEDICAÇÃO" },
    consulta: { icone: "./images/icone-18.png", classe: "consulta", label: "CONSULTA" },
    exame: { icone: "./images/icone-19.png", classe: "exame", label: "EXAME" },
    evento: { icone: "./images/icone-20.png", classe: "evento", label: "EVENTO ONG" },
  };

  // ============================================
  // 5. FUNÇÕES DE ARMAZENAMENTO (LOCALSTORAGE)
  // ============================================

  function salvarLembretesStorage(lembretes) {
    try {
      localStorage.setItem("lembretesProjetoDivas", JSON.stringify(lembretes));
    } catch (erro) {
      console.error("❌ Erro ao salvar lembretes:", erro);
    }
  }

  function carregarLembretesStorage() {
    try {
      const dados = localStorage.getItem("lembretesProjetoDivas");
      return dados ? JSON.parse(dados) : [];
    } catch (erro) {
      console.error("❌ Erro ao carregar lembretes:", erro);
      return [];
    }
  }

  function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
        <button class="btn-excluir" onclick="excluirLembrete('${lembrete.id}')">  <img src="./images/icone-15.png" alt="Excluir"> Excluir
        </button>
      </div>
    `;
    return elemento;
  }

  function carregarLembretes() {
    if (!timeline) return;

    const lembretes = carregarLembretesStorage();
    timeline.innerHTML = "";

    if (lembretes.length === 0) {
      if (msgVazia) {
        msgVazia.style.display = "block";
        timeline.appendChild(msgVazia);
      }
    } else {
      if (msgVazia) msgVazia.style.display = "none";

      // Ordena por horário (mais recente primeiro)
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
  window.excluirLembrete = function (id) {
    if (confirm("Deseja realmente excluir este lembrete?")) {
      let lembretes = carregarLembretesStorage();
      lembretes = lembretes.filter((l) => l.id !== id);
      salvarLembretesStorage(lembretes);
      carregarLembretes();
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
        id: gerarId(),
        data,
        horario,
        titulo,
        descricao,
        etiqueta: etiquetaSelecionada,
        criadoEm: new Date().toISOString(),
      };

      let lembretes = carregarLembretesStorage();
      lembretes.push(novoLembrete);
      salvarLembretesStorage(lembretes);
      carregarLembretes();

      formulario.reset();
      botoesEtiqueta.forEach((b) => b.classList.remove("active"));
      etiquetaSelecionada = null;
    });
  }

  // ============================================
  // 8. NAVEGAÇÃO DO MENU LATERAL
  // ============================================

  const botoesNavegacao = document.querySelectorAll(".bt-navegacao");
  botoesNavegacao.forEach((botao) => {
    botao.addEventListener("click", function (e) {
      // Previne apenas se for âncora vazia (#)
      if (this.getAttribute("href") === "#") {
        e.preventDefault();
      }
      // Atualiza classe active
      botoesNavegacao.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // ============================================
  // 9. CARREGAMENTO INICIAL DOS LEMBRETES
  // ============================================

  // ✅ Esta é a ÚNICA chamada necessária
  carregarLembretes();
}); // ✅ Fim do DOMContentLoaded (apenas UM)

// ============================================
// 10. FUNÇÃO DE LOGOUT/SAIR
// ============================================

function fazerLogout(event) {
  event.preventDefault(); // Previne o comportamento padrão do link

  if (confirm("Deseja realmente sair do sistema?")) {
    // Opcional: Limpar dados da sessão
    // localStorage.removeItem('lembretesProjetoDivas');
    // sessionStorage.clear();

    // Tenta fechar a janela
    window.close();

    // Se não conseguir fechar (limitação do navegador), redireciona
    setTimeout(() => {
      // Redireciona para página de login ou home
      window.location.href = "./index.html"; // ou 'login.html'
      // Ou abre uma página em branco:
      // window.location.href = 'about:blank';
    }, 500);
  }
}


// ============================================
// 11. DATA ATUAL NO TOPO
// ============================================

function atualizarDataTopo() {
  const dataHoje = new Date();
  
  // Nomes dos meses em Português
  const meses = [
    "Jan", "Fev", "Mar", "Abr",
    "Maio", "Jun", "Jul", "Ago",
    "Set", "Out", "Nov", "Dez"
  ];

  const diasSemana = [
    "Domingo", "Segunda", "Terça", "Quarta",
    "Quinta", "Sexta", "Sábado"
  ];

  // Pegando as partes da data
  const diaSemana = diasSemana[dataHoje.getDay()];
  const dia = dataHoje.getDate();
  const mes = meses[dataHoje.getMonth()];
  const ano = dataHoje.getFullYear();

  // Exemplo de resultado: "Sábado, 25 de Abril <br> 2026"
  const textoData = `${diaSemana}, ${dia} de ${mes} <br/> ${ano}`;

  // Inserindo no HTML
  const spanData = document.getElementById('data-atual');
  if (spanData) {
    spanData.innerHTML = textoData;
  }
}

// Executa assim que a página carrega
document.addEventListener('DOMContentLoaded', atualizarDataTopo);


// ============================================
// 12. FUNÇÃO PARA ATIVAR BOTÃO DE NAVEGAÇÃO
// ============================================

function ativarBotao(event, elemento) {
  // Previne o comportamento padrão do link
  // event.preventDefault(); // Remova essa linha se quiser navegar para agenda.html
  
  // Remove 'active' de todos os botões
  document.querySelectorAll('.bt-navegacao').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Adiciona 'active' no botão clicado
  elemento.classList.add('active');
}
