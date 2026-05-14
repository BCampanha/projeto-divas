console.log('📄 perfil.js carregado!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM carregado...');
  
  if (typeof AuthMock === 'undefined') {
    console.error('❌ AuthMock não carregado!');
    return;
  }

  protegerPagina();
  const usuarioLogado = AuthMock.getUsuarioLogado();
  if (!usuarioLogado) return;

  // ✅ Busca segura de elementos
  const nomeEl = document.getElementById('perfil-nome');
  const emailEl = document.getElementById('perfil-email');
  const senhaEl = document.getElementById('perfil-senha');
  const sidebarNome = document.getElementById('nome-sidebar');

  console.log('🔍 Elementos encontrados:', { nomeEl, emailEl, senhaEl, sidebarNome });

  // Preenche se encontrar
  if (nomeEl) nomeEl.textContent = usuarioLogado.nome;
  if (emailEl) emailEl.textContent = usuarioLogado.email;
  if (sidebarNome) sidebarNome.textContent = usuarioLogado.nome;

  // Busca usuário completo para a senha
  const usuarios = AuthMock.getUsuarios();
  const completo = usuarios.find(u => u.email === usuarioLogado.email);
  if (senhaEl && completo) {
    senhaEl.dataset.senhaReal = completo.senha || '';
  }

  // Função Toggle Senha
  window.toggleSenha = function() {
    const sEl = document.getElementById('perfil-senha');
    const iEl = document.getElementById('img-senha');
    if (!sEl || !iEl) return;

    if (sEl.textContent === '••••••••') {
      sEl.textContent = sEl.dataset.senhaReal;
      iEl.src = './images/icone-22.png';
    } else {
      sEl.textContent = '••••••••';
      iEl.src = './images/icone-21.png';
    }
  };

  console.log('🎉 Perfil carregado com sucesso!');
});