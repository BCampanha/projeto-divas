document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cadastro');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nome = document.getElementById('cadastro-nome').value.trim();
      const email = document.getElementById('cadastro-email').value.trim();
      const telefone = document.getElementById('cadastro-telefone').value.trim();
      const senha = document.getElementById('cadastro-senha').value;
      
      // ✅ REMOVI a validação de confirmar senha
      
      if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
      
      const resultado = await AuthMock.cadastro(nome, email, telefone, senha);
      
      if (resultado.sucesso) {
        alert('Cadastro realizado com sucesso! 🎉');
        window.location.href = './agenda.html';
      } else {
        alert(resultado.erro);
      }
    });
  }
});