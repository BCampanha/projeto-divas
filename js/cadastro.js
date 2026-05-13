document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nome = form.querySelector('input[name="nome"]').value.trim();
      const email = form.querySelector('input[name="email"]').value.trim();
      const telefone = form.querySelector('input[name="telefone"]').value.trim();
      const senha = form.querySelector('input[name="senha"]').value;
      
      const resultado = await AuthMock.cadastro(nome, email, telefone, senha);
      
      if (resultado.sucesso) {
        // com o Cadastro feito já loga e vai para a agenda
        redirecionarPorTipo(resultado.usuario);
      } else {
        alert(resultado.erro);
      }
    });
  }
});