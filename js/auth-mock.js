/* ============================================
   SIMULAÇÃO DE BACKEND - PROJETO DIVAS
   (Substituir por chamadas à API depois)
   ============================================ */

const AuthMock = {
  
  // ============================================
  // BANCO DE DADOS SIMULADO (localStorage)
  // ============================================
  
  adminCredenciais: {
    email: 'admin@projetodivas.org',
    senha: 'admin123'
  },

  salvarUsuario(usuario) {
    const usuarios = this.getUsuarios();
    usuario.id = Date.now().toString();
    usuario.criadoEm = new Date().toISOString();
    usuarios.push(usuario);
    localStorage.setItem('usuariosProjetoDivas', JSON.stringify(usuarios));
  },

  getUsuarios() {
    const dados = localStorage.getItem('usuariosProjetoDivas');
    return dados ? JSON.parse(dados) : [];
  },

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  async login(email, senha) {
    await new Promise(resolve => setTimeout(resolve, 500));

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

    const usuarios = this.getUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
      this.setUsuarioLogado(usuario);
      return { sucesso: true, usuario: usuario, tipo: 'paciente' };
    }

    return { sucesso: false, erro: 'Email ou senha inválidos' };
  },

  async cadastro(nome, email, telefone, senha) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const usuarios = this.getUsuarios();
    
    if (usuarios.find(u => u.email === email)) {
      return { sucesso: false, erro: 'Este email já está cadastrado' };
    }

    const novoUsuario = {
      nome,
      email,
      telefone,
      senha,
      tipo: 'paciente'
    };

    this.salvarUsuario(novoUsuario);
    this.setUsuarioLogado(novoUsuario);
    
    // ✅ Garante que novo usuário comece com lembretes vazios
    this.limparLembretesUsuario(novoUsuario.id);
    
    return { sucesso: true, usuario: novoUsuario };
  },

  logout() {
    localStorage.removeItem('usuarioLogadoProjetoDivas');
    window.location.href = './index.html';
  },

  // ============================================
  // SESSÃO DO USUÁRIO
  // ============================================

  setUsuarioLogado(usuario) {
    const usuarioSemSenha = { ...usuario };
    delete usuarioSemSenha.senha;
    localStorage.setItem('usuarioLogadoProjetoDivas', JSON.stringify(usuarioSemSenha));
  },

  getUsuarioLogado() {
    const dados = localStorage.getItem('usuarioLogadoProjetoDivas');
    return dados ? JSON.parse(dados) : null;
  },

  estaLogado() {
    return this.getUsuarioLogado() !== null;
  },

  isAdmin() {
    const usuario = this.getUsuarioLogado();
    return usuario && (usuario.tipo === 'admin' || usuario.email === this.adminCredenciais.email);
  },

  // ============================================
  // GERENCIAMENTO DE LEMBRETES POR USUÁRIO
  // ============================================

  _getLembretesKey(usuarioId) {
    return `lembretes_${usuarioId}`;
  },

  salvarLembretesUsuario(usuarioId, lembretes) {
    localStorage.setItem(this._getLembretesKey(usuarioId), JSON.stringify(lembretes));
  },

  getLembretesUsuario(usuarioId) {
    const dados = localStorage.getItem(this._getLembretesKey(usuarioId));
    return dados ? JSON.parse(dados) : [];
  },

  adicionarLembrete(usuarioId, lembrete) {
    const lembretes = this.getLembretesUsuario(usuarioId);
    lembrete.id = Date.now().toString();
    lembrete.criadoEm = new Date().toISOString();
    lembretes.push(lembrete);
    this.salvarLembretesUsuario(usuarioId, lembretes);
    return lembrete;
  },

  excluirLembrete(usuarioId, lembreteId) {
    const lembretes = this.getLembretesUsuario(usuarioId);
    const filtrados = lembretes.filter(l => l.id !== lembreteId);
    this.salvarLembretesUsuario(usuarioId, filtrados);
  },

  limparLembretesUsuario(usuarioId) {
    localStorage.removeItem(this._getLembretesKey(usuarioId));
  }
};

// ============================================
// FUNÇÕES DE REDIRECIONAMENTO
// ============================================

function redirecionarPorTipo(usuario) {
  if (usuario.tipo === 'admin' || usuario.email === AuthMock.adminCredenciais.email) {
    window.location.href = './admin.html';
  } else {
    window.location.href = './agenda.html';
  }
}

function protegerPagina() {
  if (!AuthMock.estaLogado()) {
    window.location.href = './index.html';
  }
}

// Exporta para uso global
window.AuthMock = AuthMock;
window.protegerPagina = protegerPagina;
window.redirecionarPorTipo = redirecionarPorTipo;


// ============================================
// ✅ NOVO: FUNÇÃO GLOBAL DE LOGOUT
// ============================================

function fazerLogout(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (confirm('Deseja realmente sair do sistema?')) {
    AuthMock.logout();
  }
}

// Exporta para uso global
window.fazerLogout = fazerLogout;