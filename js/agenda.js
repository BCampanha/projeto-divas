document.addEventListener('DOMContentLoaded', () => {
  // Protege a página (se não estiver logado, volta pro login)
  protegerPagina();
  
  const usuario = AuthMock.getUsuarioLogado();
  
  // Atualiza saudação
  const nomeSpan = document.querySelector('h1 span'); // ou #nome-paciente
  if (nomeSpan && usuario) {
    nomeSpan.textContent = usuario.nome.split(' ')[0]; // Pega só o primeiro nome
  }
  
  // Atualiza data atual (usa sua função existente)
  if (typeof atualizarDataTopo === 'function') {
    atualizarDataTopo();
  }
  
  // Aqui você mantém a lógica dos lembretes (timeline, localStorage, etc.)
  // Pode mover o código de lembretes do interacoes.js para cá se preferir
});