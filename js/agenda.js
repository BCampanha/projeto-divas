/* ============================================================
   AGENDA.JS — INICIALIZAÇÃO DA PÁGINA DE AGENDA
   Complementa interacoes.js com a saudação personalizada.
   Requer: api.js e interacoes.js carregados antes.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Atualiza a saudação "Olá, [PrimeiroNome]" no topo da página
  const usuario = Auth.getUsuarioLogado();
  const nomeSpan = document.querySelector('h1 span');
  if (nomeSpan && usuario) {
    nomeSpan.textContent = usuario.nome.split(' ')[0];
  }
});
