document.addEventListener('DOMContentLoaded', () => {
  // ✅ Use o ID específico do form
  const form = document.getElementById('form-login');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // ✅ Use os IDs específicos dos inputs
      const email = document.getElementById('login-email').value.trim();
      const senha = document.getElementById('login-senha').value;
      
      console.log('Tentando login com:', email); // Debug
      
      const resultado = await AuthMock.login(email, senha);
      
      console.log('Resultado:', resultado); // Debug
      
      if (resultado.sucesso) {
        redirecionarPorTipo(resultado.usuario);
      } else {
        alert(resultado.erro);
      }
    });
  } else {
    console.error('Formulário de login não encontrado!');
  }
});