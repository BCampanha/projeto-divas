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


   // ============================================
  // AUTENTICAÇÃO
  // ============================================

  // Login simulado
  async login(email, senha) {
    // Simula delay de rede (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verifica se é admin
    if (email === this.adminCredenciais.email && senha === this.adminCredenciais.senha) {
      const adminUser = {
        id: 'admin',
        nome: 'Administrador',
        email: email,
        tipo: 'admin'
      };
      this.setUsuarioLogado(adminUser);
      return { sucesso: true, usuario: adminUser, tipo: 'admin' };
    }

    // Busca usuário no "banco"
    const usuarios = this.getUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
      this.setUsuarioLogado(usuario);
      return { sucesso: true, usuario: usuario, tipo: 'paciente' };
    }

    return { sucesso: false, erro: 'Email ou senha inválidos' };
  },

  // Cadastro simulado
  async cadastro(nome, email, telefone, senha) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const usuarios = this.getUsuarios();
    
    // Verifica se email já existe
    if (usuarios.find(u => u.email === email)) {
      return { sucesso: false, erro: 'Este email já está cadastrado' };
    }

    const novoUsuario = {
      nome,
      email,
      telefone,
      senha, // Em produção: NUNCA salve senha assim! Use hash.
      tipo: 'paciente'
    };

    this.salvarUsuario(novoUsuario);
    this.setUsuarioLogado(novoUsuario);
    
    return { sucesso: true, usuario: novoUsuario };
  },

  // Logout
  logout() {
    localStorage.removeItem('usuarioLogadoProjetoDivas');
    window.location.href = './index.html';
  },

  // ============================================
  // SESSÃO DO USUÁRIO
  // ============================================

  // Salva usuário logado
  setUsuarioLogado(usuario) {
    // Remove senha antes de salvar na sessão
    const usuarioSemSenha = { ...usuario };
    delete usuarioSemSenha.senha;
    localStorage.setItem('usuarioLogadoProjetoDivas', JSON.stringify(usuarioSemSenha));
  },

  // Pega usuário logado
  getUsuarioLogado() {
    const dados = localStorage.getItem('usuarioLogadoProjetoDivas');
    return dados ? JSON.parse(dados) : null;
  },

  // Verifica se está logado
  estaLogado() {
    return this.getUsuarioLogado() !== null;
  },

  // Verifica se é admin
  isAdmin() {
    const usuario = this.getUsuarioLogado();
    return usuario && (usuario.tipo === 'admin' || usuario.email === this.adminCredenciais.email);
  }
};

// ============================================
// FUNÇÕES DE REDIRECIONAMENTO
// ============================================

// Redireciona baseado no tipo de usuário
function redirecionarPorTipo(usuario) {
  if (usuario.tipo === 'admin' || usuario.email === AuthMock.adminCredenciais.email) {
    window.location.href = './admin.html'; // Página do admin
  } else {
    window.location.href = './agenda.html'; // Página da agenda
  }
}

// Protege páginas (redireciona se não estiver logado)
function protegerPagina() {
  if (!AuthMock.estaLogado()) {
    window.location.href = './index.html';
  }
}

// Exporta para uso global
window.AuthMock = AuthMock;
window.protegerPagina = protegerPagina;
window.redirecionarPorTipo = redirecionarPorTipo;