/* ============================================================
   CADASTRO.JS — FORMULÁRIO DE CADASTRO DE NOVO USUÁRIO
   Chama POST /usuarios/criar no backend.
   Requer: api.js carregado antes deste script.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cadastro');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('cadastro-nome').value.trim();
    const email = document.getElementById('cadastro-email').value.trim();
    const senha = document.getElementById('cadastro-senha').value;

    // Validação mínima no frontend (o backend também valida)
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      // Cadastra o novo usuário (tipo padrão no backend: 'beneficiaria')
      // POST /usuarios/criar — retorna UsuarioResponseDTO
      await DivasAPI.cadastrarUsuario(nome, email, senha);

      alert('Cadastro realizado com sucesso! Faça login para continuar.');

      // Redireciona para o login (seção #agenda da index)
      window.location.href = './index.html#agenda';

    } catch (err) {
      // Erros comuns: "Email já cadastrado", "Senha deve ter pelo menos 6 caracteres"
      alert(err.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
});
