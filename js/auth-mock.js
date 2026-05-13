/* ============================================
   SIMULAÇÃO DE BACKEND - PROJETO DIVAS
   (Substituir por chamadas à API depois)
   ============================================ */

const AuthMock = {
  
  // ============================================
  // BANCO DE DADOS SIMULADO (localStorage)
  // ============================================
  
  // Admin padrão (email/senha fixos)
  adminCredenciais: {
    email: 'admin@projetodivas.org',
    senha: 'admin123'
  },

  // Salvar usuário no "banco"
  salvarUsuario(usuario) {
    const usuarios = this.getUsuarios();
    usuario.id = Date.now().toString(); // ID único
    usuario.criadoEm = new Date().toISOString();
    usuarios.push(usuario);
    localStorage.setItem('usuariosProjetoDivas', JSON.stringify(usuarios));
  },

  // Pegar todos os usuários
  getUsuarios() {
    const dados = localStorage.getItem('usuariosProjetoDivas');
    return dados ? JSON.parse(dados) : [];
  },
}