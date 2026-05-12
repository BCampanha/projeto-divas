/* ============================================
   INTERAÇÕES DO SITE - PROJETO DIVAS
   Arquivo: interacoes.js
   ============================================ */

// Aguarda o carregamento total do HTML antes de rodar os scripts
document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. MÁSCARA DE DATA (DD/MM/AAAA)
  // ============================================
  const dataInput = document.getElementById('data-input');
  
  if (dataInput) {
    dataInput.addEventListener('input', function(e) {
      let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
      
      if (valor.length > 8) valor = valor.slice(0, 8); // Limita a 8 dígitos
      
      // Adiciona as barras automaticamente
      if (valor.length > 2 && valor.length <= 4) {
        valor = valor.slice(0, 2) + '/' + valor.slice(2);
      } else if (valor.length > 4) {
        valor = valor.slice(0, 2) + '/' + valor.slice(2, 4) + '/' + valor.slice(4);
      }
      
      e.target.value = valor;
    });
  }

  // ============================================
  // 2. MÁSCARA DE HORÁRIO (HH:MM)
  // ============================================
  const horarioInput = document.getElementById('horario-input');
  
  if (horarioInput) {
    horarioInput.addEventListener('input', function(e) {
      let valor = e.target.value.replace(/\D/g, '');
      
      if (valor.length > 4) valor = valor.slice(0, 4);
      
      if (valor.length > 2) {
        valor = valor.slice(0, 2) + ':' + valor.slice(2);
      }
      
      e.target.value = valor;
    });

    // Validação ao sair do campo
    horarioInput.addEventListener('blur', function(e) {
      const valor = e.target.value;
      const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
      
      if (valor && !regexHora.test(valor)) {
        e.target.value = '';
        alert('Por favor, insira um horário válido (ex: 14:30)');
      }
    });
  }

  // ============================================
  // 3. SELEÇÃO DE ETIQUETAS
  // ============================================
  const botoesEtiqueta = document.querySelectorAll('.etiqueta-btn');
  let etiquetaSelecionada = null;

  botoesEtiqueta.forEach(btn => {
    btn.addEventListener('click', () => {
      botoesEtiqueta.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      etiquetaSelecionada = btn.dataset.tag;
    });
  });

  // ============================================
  // 4. CRIAÇÃO DE LEMBRETES (TIMELINE)
  // ============================================
  const formulario = document.getElementById('form-lembrete');
  const timeline = document.getElementById('timeline-lembretes');
  const msgVazia = document.querySelector('.mensagem-vazia') || document.getElementById('msg-vazia');

  // Configuração visual das etiquetas
  const configEtiquetas = {
    medicacao: { icone: '💊', classe: 'medicacao', label: 'MEDICAÇÃO' },
    consulta:  { icone: '🩺', classe: 'consulta',  label: 'CONSULTA' },
    exame:     { icone: '🔬', classe: 'exame',     label: 'EXAME' },
    evento:    { icone: '🤝', classe: 'evento',    label: 'EVENTO ONG' }
  };

  if (formulario && timeline) {
    formulario.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validação da etiqueta
      if (!etiquetaSelecionada) {
        alert('Por favor, selecione uma etiqueta (Medicação, Consulta, etc).');
        return;
      }

      // Captura dos dados
      const data = document.getElementById('data-input')?.value || '';
      const horario = document.getElementById('horario-input')?.value || '';
      const titulo = document.getElementById('titulo-input')?.value || '';
      const descricao = document.getElementById('descricao-input')?.value || '';

      // Esconde mensagem de "vazio" se existir
      if (msgVazia) msgVazia.style.display = 'none';

      // Configuração da etiqueta escolhida
      const config = configEtiquetas[etiquetaSelecionada];
      
      // Cria o elemento do card
      const novoLembrete = document.createElement('div');
      novoLembrete.classList.add('lembrete-item');
      
      novoLembrete.innerHTML = `
        <div class="icone-timeline ${config.classe}">${config.icone}</div>
        <div class="card-lembrete">
          <div class="card-header">
            <span class="card-hora">${horario}</span>
            <span class="etiqueta ${config.classe}">${config.label}</span>
          </div>
          <h3 class="card-titulo">${titulo}</h3>
          <p class="card-descricao">${descricao}</p>
          <small class="card-data">📅 ${data}</small>
        </div>
      `;

      // Adiciona na timeline (append = novo embaixo)
      timeline.appendChild(novoLembrete);

      // Reset do formulário e etiquetas
      formulario.reset();
      botoesEtiqueta.forEach(b => b.classList.remove('active'));
      etiquetaSelecionada = null;
    });
  }

  // ============================================
  // 5. NAVEGAÇÃO DO MENU LATERAL
  // ============================================
  const botoesNavegacao = document.querySelectorAll('.bt-navegacao');

  botoesNavegacao.forEach(botao => {
    botao.addEventListener('click', function(e) {
      // Se for um link de navegação real (#), previne o scroll instantâneo
      if(this.getAttribute('href') === '#') {
        e.preventDefault();
      }
      
      // Troca a classe active
      botoesNavegacao.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

}); // Fim do DOMContentLoaded