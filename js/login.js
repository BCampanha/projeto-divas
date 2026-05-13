document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.querySelector('input[name="e-mail"]').value.trim();
      const senha = form.querySelector('input[name="senha"]').value;
      
      const resultado = await AuthMock.login(email, senha);
      
      if (resultado.sucesso) {
        // Redireciona automaticamente baseado no tipo
        redirecionarPorTipo(resultado.usuario);
      } else {
        alert(resultado.erro);
      }
    });
  }
});