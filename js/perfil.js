/* ============================================================
   PERFIL.JS — PÁGINA DE PERFIL DO USUÁRIO
   Exibe os dados do usuário logado buscando do backend.
   Requer: api.js carregado antes deste script.
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // A proteção de rota é feita por interacoes.js (carregado antes)
  // mas garantimos aqui também para o caso de perfil.html ser aberto diretamente
  if (!Auth.estaLogado()) {
    window.location.href = './index.html';
    return;
  }

  /* ---- Exibe dados em cache imediatamente (sem esperar a API) ---- */
  const usuarioCached = Auth.getUsuarioLogado();
  if (usuarioCached) {
    atualizarCampos(usuarioCached.nome, usuarioCached.email);
  }

  /* ---- Busca dados atualizados do servidor ---- */
  try {
    // GET /usuarios/{id} — retorna UsuarioResponseDTO com dados frescos
    const usuarioAtualizado = await DivasAPI.buscarUsuario(usuarioCached.id);

    // Atualiza a tela com os dados mais recentes
    atualizarCampos(usuarioAtualizado.nome, usuarioAtualizado.email);

    // Atualiza o cache local para refletir possíveis mudanças remotas
    const sessaoAtualizada = {
      ...usuarioCached,
      nome: usuarioAtualizado.nome,
      email: usuarioAtualizado.email
    };
    localStorage.setItem(Auth.USUARIO_KEY, JSON.stringify(sessaoAtualizada));

    // Atualiza o nome na sidebar (pode ter sido carregado por interacoes.js antes)
    const nomeSidebar = document.getElementById('nome-sidebar');
    if (nomeSidebar) nomeSidebar.textContent = usuarioAtualizado.nome;

  } catch (err) {
    console.error('Erro ao buscar dados do perfil:', err);
    // Mantém os dados em cache na tela sem alertar o usuário
  }

  /* ---- Toggle de exibição da senha ----
     O backend não retorna a senha (está marcada com @JsonIgnore).
     O botão de olho apenas alterna o placeholder visual "••••••••". */
  window.toggleSenha = function() {
    const sEl  = document.getElementById('perfil-senha');
    const iEl  = document.getElementById('img-senha');
    if (!sEl || !iEl) return;

    // Alterna entre asteriscos e texto "oculto" (sem revelar senha real)
    if (sEl.textContent === '••••••••') {
      sEl.textContent = '(senha não disponível)';
      iEl.src = './images/icone-22.png';
    } else {
      sEl.textContent = '••••••••';
      iEl.src = './images/icone-21.png';
    }
  };
});

/* Preenche os campos de exibição no HTML */
function atualizarCampos(nome, email) {
  const nomeEl  = document.getElementById('perfil-nome');
  const emailEl = document.getElementById('perfil-email');

  if (nomeEl)  nomeEl.textContent  = nome;
  if (emailEl) emailEl.textContent = email;
}
