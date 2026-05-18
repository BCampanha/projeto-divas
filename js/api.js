/* ============================================================
   API.JS — CLIENTE DE API DO PROJETO DIVAS
   Substitui o auth-mock.js (localStorage). Toda comunicação
   com o backend Spring Boot passa por este arquivo.

   Pré-requisito: o backend deve estar rodando em API_URL.
   CORS configurado para portas 8081 (este frontend via Live
   Server) e 8080 (backend). Ajuste API_URL conforme o ambiente.
   ============================================================ */

// URL base do backend Spring Boot (porta padrão do Spring)
const API_URL = 'http://localhost:8080';

/* ============================================================
   SESSÃO DO USUÁRIO
   O token JWT e os dados básicos do usuário logado ficam no
   localStorage. Não armazenamos senha em nenhum momento.
   ============================================================ */
const Auth = {
  // Chaves usadas no localStorage
  TOKEN_KEY: 'divas_token',
  USUARIO_KEY: 'divas_usuario',

  /* Salva token + dados do usuário após login bem-sucedido.
     Recebe o LoginResponseDTO do backend. */
  salvar(loginResponse) {
    localStorage.setItem(this.TOKEN_KEY, loginResponse.token);
    localStorage.setItem(this.USUARIO_KEY, JSON.stringify({
      id: loginResponse.idUsuario,       // Long do banco
      nome: loginResponse.nome,
      email: loginResponse.email,
      tipo: loginResponse.tipoUsuario    // 'beneficiaria' ou 'administrador'
    }));
  },

  // Retorna o token JWT armazenado (ou null se não logado)
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  // Retorna o objeto { id, nome, email, tipo } do usuário logado
  getUsuarioLogado() {
    const raw = localStorage.getItem(this.USUARIO_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // true se há token E dados de usuário na sessão
  estaLogado() {
    return this.getToken() !== null && this.getUsuarioLogado() !== null;
  },

  // true se o tipo do usuário logado é administrador
  isAdmin() {
    const u = this.getUsuarioLogado();
    return u !== null && u.tipo === 'administrador';
  },

  // Limpa a sessão e redireciona para a página inicial (login)
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    window.location.href = './index.html';
  }
};

/* ============================================================
   FETCH COM AUTENTICAÇÃO
   Wrapper em volta do fetch nativo que:
   - adiciona o cabeçalho Authorization com o token JWT
   - trata erros HTTP (401 redireciona para login)
   - desserializa o JSON da resposta
   ============================================================ */
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Injeta o token em toda requisição autenticada
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_URL + path, { ...options, headers });

  // Token expirado ou inexistente → encerra a sessão e vai para login
  if (response.status === 401) {
    Auth.logout();
    return;
  }

  // Resposta sem corpo (ex: DELETE bem-sucedido)
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return null;
  }

  const data = JSON.parse(text);

  // Resposta de erro do backend (ErroResponseDTO: { status, erro, path })
  if (!response.ok) {
    throw new Error(data.erro || data.message || 'Erro na requisição');
  }

  return data;
}

/* ============================================================
   UTILITÁRIOS DE DATA
   O backend usa LocalDateTime (ISO 8601: "YYYY-MM-DDTHH:MM:SS").
   O frontend exibe no formato brasileiro "DD/MM/YYYY" + "HH:MM".
   ============================================================ */

// Converte "DD/MM/YYYY" + "HH:MM" → "YYYY-MM-DDTHH:MM:00" (para enviar ao backend)
function dataHoraParaISO(data, horario) {
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${horario}:00`;
}

// Converte "YYYY-MM-DDTHH:MM:SS" (do backend) → { data: "DD/MM/YYYY", horario: "HH:MM" }
function ISOParaDataHora(iso) {
  // O backend serializa LocalDateTime como array [ano,mes,dia,hora,min,seg]
  // ou como string ISO. Tratamos ambos os casos.
  let dt;
  if (Array.isArray(iso)) {
    // Spring boot com Jackson padrão serializa LocalDateTime como array
    // [ano, mes (1-based), dia, hora, minuto, segundo]
    dt = new Date(iso[0], iso[1] - 1, iso[2], iso[3] || 0, iso[4] || 0);
  } else {
    dt = new Date(iso);
  }

  const dia = String(dt.getDate()).padStart(2, '0');
  const mes = String(dt.getMonth() + 1).padStart(2, '0');
  const ano = dt.getFullYear();
  const hora = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');

  return { data: `${dia}/${mes}/${ano}`, horario: `${hora}:${min}` };
}

/* ============================================================
   UTILITÁRIOS DE ENCODING
   O AgendamentoDTO não tem campo "titulo" separado, então
   codificamos o título dentro do campo "descricao" usando
   o prefixo [TITULO:...]. O backend não interpreta isso —
   apenas o frontend usa a convenção.
   ============================================================ */

// Encoda título na descrição: "[TITULO:Quimio] Levar exames"
function encodarTituloDescricao(titulo, descricao) {
  return `[TITULO:${titulo}] ${descricao}`;
}

// Decoda descrição → { titulo, descricao }
function decodarTituloDescricao(descricaoRaw) {
  const match = descricaoRaw?.match(/^\[TITULO:(.*?)\]\s*([\s\S]*)/);
  if (match) {
    return { titulo: match[1], descricao: match[2] };
  }
  // Descrição sem marcador (evento salvo da agenda pública ou formato antigo)
  return { titulo: descricaoRaw || '', descricao: '' };
}

// Encoda facilitadora na descrição de um evento público:
// "Facilitadora: Dra. Ana\nDescrição do evento"
function encodarFacilitadoraDescricao(facilitadora, descricao) {
  if (facilitadora && facilitadora.trim()) {
    return `Facilitadora: ${facilitadora.trim()}\n${descricao || ''}`;
  }
  return descricao || '';
}

// Decoda descrição de evento → { facilitadora, descricao }
function decodarFacilitadoraDescricao(descricaoRaw) {
  const match = descricaoRaw?.match(/^Facilitadora: (.+?)(?:\n([\s\S]*))?$/);
  if (match) {
    return { facilitadora: match[1], descricao: match[2] || '' };
  }
  return { facilitadora: '', descricao: descricaoRaw || '' };
}

/* ============================================================
   DivasAPI — TODOS OS ENDPOINTS DO BACKEND
   ============================================================ */
const DivasAPI = {

  /* ----------------------------------------------------------
     USUÁRIOS
     ---------------------------------------------------------- */

  // POST /usuarios/login — retorna LoginResponseDTO
  async login(email, senha) {
    return apiFetch('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
  },

  // POST /usuarios/criar — retorna UsuarioResponseDTO (cadastro público)
  async cadastrarUsuario(nome, email, senha) {
    return apiFetch('/usuarios/criar', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha })
    });
  },

  // GET /usuarios/{id} — retorna UsuarioResponseDTO (requer autenticação)
  async buscarUsuario(id) {
    return apiFetch(`/usuarios/${id}`);
  },

  // PUT /usuarios/atualizar/{id} — atualiza dados do próprio usuário
  async atualizarUsuario(id, dados) {
    return apiFetch(`/usuarios/atualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  },

  // POST /usuarios/esqueci-senha — envia e-mail com token de recuperação
  async esqueciSenha(email) {
    return apiFetch('/usuarios/esqueci-senha', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // POST /usuarios/resetar-senha — redefine a senha com o token recebido por e-mail
  async resetarSenha(token, novaSenha) {
    return apiFetch('/usuarios/resetar-senha', {
      method: 'POST',
      body: JSON.stringify({ token, novaSenha })
    });
  },

  /* ----------------------------------------------------------
     AGENDAMENTOS (lembretes pessoais da beneficiária)
     O backend filtra automaticamente pelo usuário do token JWT.
     ---------------------------------------------------------- */

  // GET /agendamentos — lista os agendamentos do usuário logado
  async listarAgendamentos() {
    return apiFetch('/agendamentos');
  },

  // POST /agendamentos — cria um agendamento pessoal
  // payload: { usuario: {idUsuario}, localidade: {idLocal}, tipoEvento, descricao, dataInicio, dataFim }
  async criarAgendamento(payload) {
    return apiFetch('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // DELETE /agendamentos/{id} — exclui um agendamento (só o dono ou admin)
  async excluirAgendamento(id) {
    return apiFetch(`/agendamentos/${id}`, { method: 'DELETE' });
  },

  /* ----------------------------------------------------------
     EVENTOS PÚBLICOS (criados pelo admin, visíveis para todos)
     ---------------------------------------------------------- */

  // GET /eventos-divas — lista todos os eventos públicos
  async listarEventos() {
    return apiFetch('/eventos-divas');
  },

  // POST /eventos-divas — cria evento público (somente admin)
  // payload: { localidade: {idLocal}, tipoEvento, titulo, descricao, dataInicio, dataFim, online, status }
  async criarEvento(payload) {
    return apiFetch('/eventos-divas', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // DELETE /eventos-divas/{id} — exclui evento público (somente admin)
  async excluirEvento(id) {
    return apiFetch(`/eventos-divas/${id}`, { method: 'DELETE' });
  },

  // POST /eventos-divas/{idEvento}/salvar-na-agenda/{idUsuario}
  // Salva um evento público na agenda pessoal da beneficiária (cria um agendamento)
  async salvarEventoNaAgenda(idEvento, idUsuario) {
    return apiFetch(`/eventos-divas/${idEvento}/salvar-na-agenda/${idUsuario}`, {
      method: 'POST'
    });
  },

  /* ----------------------------------------------------------
     LOCALIDADES
     Locais físicos vinculados a agendamentos e eventos.
     O admin deve cadastrar pelo menos uma localidade antes de
     criar eventos ou que beneficiárias criem lembretes.
     ---------------------------------------------------------- */

  // GET /localidades — lista todas as localidades cadastradas
  async listarLocalidades() {
    return apiFetch('/localidades');
  },

  // POST /localidades — cria uma nova localidade
  async criarLocalidade(payload) {
    return apiFetch('/localidades', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

/* ============================================================
   FUNÇÕES GLOBAIS DE NAVEGAÇÃO E SESSÃO
   Substituem as funções equivalentes do auth-mock.js.
   ============================================================ */

// Redireciona para a página correta conforme o tipo de usuário
function redirecionarPorTipo(usuario) {
  if (usuario.tipo === 'administrador') {
    window.location.href = './admin.html';
  } else {
    window.location.href = './agenda.html';
  }
}

// Redireciona para login se o usuário não estiver autenticado
function protegerPagina() {
  if (!Auth.estaLogado()) {
    window.location.href = './index.html';
  }
}

// Exibe confirmação e encerra a sessão (usada pelo botão "Sair")
function fazerLogout(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (confirm('Deseja realmente sair do sistema?')) {
    Auth.logout();
  }
}

/* ============================================================
   EXPORTA PARA USO GLOBAL (acessível via window em todos os
   scripts carregados após este arquivo)
   ============================================================ */
window.Auth = Auth;
window.DivasAPI = DivasAPI;
window.protegerPagina = protegerPagina;
window.redirecionarPorTipo = redirecionarPorTipo;
window.fazerLogout = fazerLogout;
window.dataHoraParaISO = dataHoraParaISO;
window.ISOParaDataHora = ISOParaDataHora;
window.encodarTituloDescricao = encodarTituloDescricao;
window.decodarTituloDescricao = decodarTituloDescricao;
window.encodarFacilitadoraDescricao = encodarFacilitadoraDescricao;
window.decodarFacilitadoraDescricao = decodarFacilitadoraDescricao;
