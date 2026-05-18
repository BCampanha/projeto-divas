/* ============================================================
   LOGIN.JS — FORMULÁRIO DE LOGIN + RECUPERAÇÃO DE SENHA
   Requer: api.js carregado antes deste script.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- LOGIN ---------- */
  const form = document.getElementById('form-login');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('login-email').value.trim();
      const senha = document.getElementById('login-senha').value;

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      try {
        const resposta = await DivasAPI.login(email, senha);
        Auth.salvar(resposta);
        redirecionarPorTipo({ tipo: resposta.tipoUsuario });
      } catch (err) {
        alert(err.message || 'Email ou senha inválidos.');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  /* ---------- MODAL: ESQUECI MINHA SENHA ---------- */
  const modal    = document.getElementById('modal-senha');
  const passo1   = document.getElementById('modal-passo-1');
  const passo2   = document.getElementById('modal-passo-2');
  const msgP1    = document.getElementById('msg-passo-1');
  const msgP2    = document.getElementById('msg-passo-2');

  if (!modal) return;

  function setMsg(el, texto, tipo) {
    el.textContent = texto;
    el.className = 'modal-msg' + (tipo ? ' ' + tipo : '');
  }

  function abrirModal() {
    document.getElementById('reset-email').value = '';
    document.getElementById('reset-token').value = '';
    document.getElementById('reset-nova-senha').value = '';
    document.getElementById('reset-confirma-senha').value = '';
    setMsg(msgP1, '', '');
    setMsg(msgP2, '', '');
    passo1.style.display = 'flex';
    passo2.style.display = 'none';
    modal.style.display = 'flex';
  }

  function fecharModal() {
    modal.style.display = 'none';
  }

  document.getElementById('link-esqueci-senha')
    ?.addEventListener('click', (e) => { e.preventDefault(); abrirModal(); });

  document.getElementById('btn-fechar-modal')
    ?.addEventListener('click', fecharModal);

  modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });

  // Passo 1: envia código para o e-mail
  document.getElementById('btn-enviar-codigo')
    ?.addEventListener('click', async () => {
      const email = document.getElementById('reset-email').value.trim();
      if (!email) { setMsg(msgP1, 'Informe seu e-mail.', 'erro'); return; }

      const btn = document.getElementById('btn-enviar-codigo');
      btn.disabled = true;
      setMsg(msgP1, '', '');

      try {
        await DivasAPI.esqueciSenha(email);
        setMsg(msgP1, 'Código enviado! Verifique seu e-mail.', 'sucesso');
        setTimeout(() => {
          passo1.style.display = 'none';
          passo2.style.display = 'flex';
        }, 1500);
      } catch (err) {
        setMsg(msgP1, err.message || 'Erro ao enviar o código. Tente novamente.', 'erro');
      } finally {
        btn.disabled = false;
      }
    });

  // Passo 2: redefine a senha com o token recebido
  document.getElementById('btn-redefinir-senha')
    ?.addEventListener('click', async () => {
      const token         = document.getElementById('reset-token').value.trim();
      const novaSenha     = document.getElementById('reset-nova-senha').value;
      const confirmaSenha = document.getElementById('reset-confirma-senha').value;

      if (!token)                   { setMsg(msgP2, 'Informe o código recebido por e-mail.', 'erro'); return; }
      if (novaSenha.length < 6)     { setMsg(msgP2, 'A senha deve ter ao menos 6 caracteres.', 'erro'); return; }
      if (novaSenha !== confirmaSenha) { setMsg(msgP2, 'As senhas não coincidem.', 'erro'); return; }

      const btn = document.getElementById('btn-redefinir-senha');
      btn.disabled = true;
      setMsg(msgP2, '', '');

      try {
        await DivasAPI.resetarSenha(token, novaSenha);
        setMsg(msgP2, 'Senha redefinida com sucesso! Faça login.', 'sucesso');
        setTimeout(fecharModal, 2000);
      } catch (err) {
        setMsg(msgP2, err.message || 'Código inválido ou expirado.', 'erro');
      } finally {
        btn.disabled = false;
      }
    });

});
