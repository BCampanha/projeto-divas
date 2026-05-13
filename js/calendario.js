const Calendario = {
  dataAtual: new Date(2026, 3, 1), // Abril 2026 (mês começa do 0)
  diaSelecionado: null,
  
  meses: [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ],

  init() {
    this.renderizar();
    this.adicionarEventos();
  },

  renderizar() {
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();
    
    // Atualiza título
    document.getElementById('mes-ano').textContent = `${this.meses[mes]} ${ano}`;
    
    const grid = document.getElementById('grid-dias');
    grid.innerHTML = '';
    
    // Primeiro dia do mês (0 = Domingo, 1 = Segunda, etc.)
    const primeiroDia = new Date(ano, mes, 1).getDay();
    // Total de dias no mês
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    // Dias do mês anterior
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    
    // Dias do mês anterior (cinza)
    for (let i = primeiroDia - 1; i >= 0; i--) {
      const dia = document.createElement('div');
      dia.classList.add('dia', 'outro-mes');
      dia.textContent = diasMesAnterior - i;
      grid.appendChild(dia);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= diasNoMes; i++) {
      const dia = document.createElement('div');
      dia.classList.add('dia');
      dia.textContent = i;
      
      // Marca dia selecionado
      if (this.diaSelecionado && 
          this.diaSelecionado.dia === i && 
          this.diaSelecionado.mes === mes && 
          this.diaSelecionado.ano === ano) {
        dia.classList.add('selecionado');
        const ponto = document.createElement('span');
        ponto.classList.add('ponto');
        dia.appendChild(ponto);
      }
      
      dia.addEventListener('click', () => this.selecionarDia(i, mes, ano));
      grid.appendChild(dia);
    }
    
    // Completa o grid com dias do próximo mês
    const totalCelulas = grid.children.length;
    const diasRestantes = 42 - totalCelulas; // 6 semanas x 7 dias
    
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = document.createElement('div');
      dia.classList.add('dia', 'outro-mes');
      dia.textContent = i;
      grid.appendChild(dia);
    }
  },

  selecionarDia(dia, mes, ano) {
    this.diaSelecionado = { dia, mes, ano };
    this.renderizar();
    
    // Formata data DD/MM/YYYY
    const diaFmt = String(dia).padStart(2, '0');
    const mesFmt = String(mes + 1).padStart(2, '0');
    const dataCompleta = `${diaFmt}/${mesFmt}/${ano}`;
    
    // Atualiza o input
    const input = document.getElementById('data-input');
    if (input) {
      input.value = dataCompleta;
    }
  },

  mesAnterior() {
    this.dataAtual.setMonth(this.dataAtual.getMonth() - 1);
    this.renderizar();
  },

  mesProximo() {
    this.dataAtual.setMonth(this.dataAtual.getMonth() + 1);
    this.renderizar();
  },

  adicionarEventos() {
    document.getElementById('btn-anterior').addEventListener('click', () => this.mesAnterior());
    document.getElementById('btn-proximo').addEventListener('click', () => this.mesProximo());
  }
};

// Inicializa o calendário
Calendario.init();