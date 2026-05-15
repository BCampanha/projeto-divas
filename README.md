# projeto-divas
Sistema web para divulgação institucional e apoio organizacional da ONG Projeto Divas, a fim de ampliar sua visibilidade e facilitar o acesso de pacientes, voluntários e comunidade às informações e serviços oferecidos.


# 📌 Visão Geral do mock

Foi desenvolvido um backend simulado (**mock**) utilizando `localStorage` para testes de navegação e usabilidade do frontend.

Para conectar o sistema à API real, siga as instruções abaixo.


**Status atual:**
- ✅ Frontend 100% funcional
- ✅ Sistema de autenticação mockado
- ✅ Agenda com lembretes pessoais
- ✅ Painel administrativo para publicação de eventos
- ✅ Eventos públicos visíveis para todos os pacientes

Para conectar o sistema à API real, siga as instruções abaixo.

---

# 📁 Estrutura da pasta `js`

```bash
📂 js/
├── auth-mock.js      ← (COMPARTILHADO) Simulação do backend
├── interacoes.js     ← (COMPARTILHADO) Máscaras, calendário, scroll, etc.

├── atividades.js     ← (ESPECÍFICO) Visualização dos cards por categoria
├── filtros.js        ← (ESPECÍFICO) Filtros de botões e exibição por categoria
├── login.js          ← (ESPECÍFICO) Lógica da página inicial
├── cadastro.js       ← (ESPECÍFICO) Lógica da página de cadastro
├── agenda.js         ← (ESPECÍFICO) Lembretes, saudação e data atual
└── perfil.js         ← (ESPECÍFICO) Dados da conta
```

---
# 🔐 Autenticação e Autorização
## Níveis de Acesso
O sistema possui dois tipos de usuário:

| Tipo      | Acesso |
|------------|---------|
| `paciente` | Agenda pessoal, perfil e lembretes individuais |
| `admin`    | Painel administrativo e publicação de eventos para todos |


## Verificação no Frontend:
```js
// Verifica se é admin
if (!AuthMock.isAdmin()) {
  window.location.href = './index.html';
}

// O método isAdmin() verifica:
// 1. usuario.tipo === 'admin'
// 2. OU email === 'admin@projetodivas.org'
```


## Endpoint de Verificação Sugerido
````js
GET /api/usuario/me/role
Authorization: Bearer <token>

# Resposta:
{
  "tipo": "admin",
  "permissoes": ["publicar_eventos", "gerenciar_usuarios"]
}
````


# 📢 Eventos Públicos da ONG
Eventos publicados pelo admin aparecem na agenda de todos os pacientes.
##Diferença entre Lembretes e Eventos:

| Característica | Lembrete Pessoal | Evento Público |
|----------------|------------------|-----------------|
| **Quem cria** | Paciente | Admin |
| **Quem vê** | Apenas o criador | Todos os pacientes |
| **Armazenamento** | `lembretes_{userId}` | `eventosPublicos` |
| **Pode excluir** | Criador | Apenas Admin |
| **Ícone** | Varia por etiqueta | Sempre `icone-20.png` |


## Estrutura de Dados: Evento Público
````js
{
  id: string,
  titulo: string,
  facilitadora: string,    // Nome de quem conduz o evento
  data: string,            // DD/MM/YYYY
  horario: string,         // HH:mm
  descricao: string,
  publicadoEm: ISO string, // Data de publicação
  publicadoPor: string,    // ID do admin
  tipo: 'evento-ong'
}
````
## Fluxo de Integração
1. Admin publica evento → POST /api/eventos-publicos
2. Backend salva no banco
3. Paciente abre agenda → GET /api/agenda
4. Backend retorna:
   ````js
   {
     "lembretesPessoais": [...],
     "eventosPublicos": [...]
   }
   ````
5. Frontend mescla e ordena por data/horário
---

# 🔐 Arquivo principal: `/js/auth-mock.js`

## Funções disponíveis

```js
AuthMock.login(email, senha)
AuthMock.cadastro(nome, email, telefone, senha)
AuthMock.getUsuarioLogado()
AuthMock.estaLogado()
AuthMock.isAdmin()
AuthMock.getUsuarios()
AuthMock.salvarUsuario(usuario)
AuthMock.adicionarLembrete(usuarioId, lembrete)
AuthMock.getLembretesUsuario(usuarioId)
AuthMock.excluirLembrete(usuarioId, lembreteId)
```

---

# 🔄 Como substituir pela API real?

## ✅ Método 1 — Criar um novo arquivo (RECOMENDADO)

Crie um novo arquivo:

```bash
/js/auth-api.js
```

Implemente as **mesmas funções** existentes no `auth-mock.js`.

Depois, altere no HTML:

### Antes

```html
<script src="./js/auth-mock.js"></script>
```

### Depois

```html
<script src="./js/auth-api.js"></script>
```

---

## ✅ Método 2 — Modificar o arquivo existente

Edite diretamente o `auth-mock.js`.

Substitua os usos de `localStorage` por chamadas com:

- `fetch()`
- `axios`

⚠️ Importante: manter os **mesmos nomes de funções** para evitar quebrar o frontend.

---

# 📡 Exemplo usando `fetch`

## Antes

```js
salvarLembretesStorage(lembretes) {
  localStorage.setItem('lembretes', JSON.stringify(lembretes));
}
```

## Depois

```js
async salvarLembretesStorage(lembretes) {
  try {
    const response = await fetch(
      'https://api.projetodivas.com/lembretes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(lembretes)
      }
    );

    return await response.json();

  } catch (error) {
    console.error('Erro ao salvar lembrete:', error);
    throw error;
  }
}
```

---

# 📡 Endpoints necessários

##Autenticação e Usuários:

| Método | Endpoint | Função |
|---|---|---|
| `POST` | `/api/login` | Autenticar usuário |
| `POST` | `/api/cadastro` | Cadastrar usuário |
| `GET` | `/api/usuario/:me` | Dados do usuário logado |
| `PUT` | `/api/usuario/:id` | 	Buscar dados do usuário |
| `PUT` | `/api/usuario/:id` | Atualizar usuário |
| `GET` | `/api/usuarios` | Listar usuários (admin) |

##Lembretes Pessoais:
| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/api/lembretes` | Listar lembretes do usuário |
| `POST` | `/api/lembretes` | Criar lembrete |
| `DELET` | `/api/lembretes/:id` | Excluir lembrete |

##Eventos Públicos (NOVO):

| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/api/eventos-publicos` | Listar todos os eventos |
| `POST` | `/api/eventos-publicos` | Publicar evento (admin) |
| `PUT` | `/api/eventos-publicos/:id` | Editar evento (admin) |
| `DELET` | `/api/eventos-publicos/:id` | Excluir evento (admin) |

##Agenda Consolidada
| Método | Endpoint | Função |
|---|---|---|
| `GET` | `/api/AGENDA` | Retorna lembretes + eventos públicos ordenados |

---

# 📊 Estrutura de dados esperada

## 👤 Usuário

```js
{
  id: string,
  nome: string,
  email: string,
  telefone: string,
  senha: string, // HASH
  tipo: 'paciente' | 'admin',
  criadoEm: ISO date string
}
```

---

## 📅 Lembrete Pessoal

```js
{
  id: string,
  usuarioId: string,
  data: string, // DD/MM/YYYY
  horario: string, // HH:mm
  titulo: string,
  descricao: string,
  etiqueta: 'medicacao' | 'consulta' | 'exame',
  criadoEm: ISO date string
}
```
## 🤝 Evento Público

````js
{
  id: string,
  titulo: string,
  facilitadora: string,
  data: string, // DD/MM/YYYY
  horario: string, // HH:mm
  descricao: string,
  publicadoEm: ISO date string,
  publicadoPor: string, // ID do admin
  tipo: 'evento-ong'
}
````

---

# 🔧 Arquivos que podem precisar de ajustes

```bash
/js/auth-mock.js   ← PRINCIPAL (substituir por auth-api.js)
/js/login.js       ← Ajustar tratamento de erros
/js/cadastro.js    ← Ajustar tratamento de erros
/js/agenda.js      ← Buscar lembretes e eventos da API
/js/admin.js       ← Publicar/gerenciar eventos via API
/js/perfil.js      ← Buscar dados do usuário da API
```

---

# 🎯 Checklist para Integração

## 🔐 Auth & Usuários
- [ ] Configurar URL base da API
- [ ] Implementar `POST /api/login` com JWT
- [ ] Implementar `POST /api/cadastro` com validação de email único
- [ ] Implementar hash de senha com `bcrypt` ou `argon2`
- [ ] Criar middleware de verificação de token
- [ ] Criar middleware de verificação de role (`admin` / `paciente`)
- [ ] Implementar refresh token

---

## 📝 Lembretes Pessoais
- [ ] Implementar `GET /api/lembretes` (filtrado por `usuarioId`)
- [ ] Implementar `POST /api/lembretes` (validar usuário logado)
- [ ] Implementar `DELETE /api/lembretes/:id` (validar permissão do dono)

---

## 🤝 Eventos Públicos
- [ ] Implementar `GET /api/eventos-publicos` (público ou autenticado)
- [ ] Implementar `POST /api/eventos-publicos` (apenas admin)
- [ ] Implementar `PUT /api/eventos-publicos/:id` (apenas admin)
- [ ] Implementar `DELETE /api/eventos-publicos/:id` (apenas admin)

---

## 🗓️ Agenda do Paciente
- [ ] Criar endpoint que retorna lembretes + eventos públicos mesclados
- [ ] Implementar ordenação por data/horário no backend (ou frontend)

---

## ✅ Testes de Fluxo
- [ ] Testar fluxo: cadastro → login → criar lembrete → visualizar na agenda
- [ ] Testar fluxo: login admin → publicar evento → visualizar na agenda do paciente
- [ ] Testar exclusão de lembrete (somente o dono pode excluir)
- [ ] Testar exclusão de evento (somente admin pode excluir)
- [ ] Testar acesso não autorizado às rotas de admin
- [ ] Testar ordenação correta (eventos mais próximos primeiro)

---

## 🚀 Produção
- [ ] Configurar variáveis de ambiente para URL da API
- [ ] Habilitar HTTPS obrigatório
- [ ] Implementar rate limiting nas rotas de autenticação
- [ ] Configurar backup automático do banco de dados
- [ ] Implementar logs de erro
- [ ] Validar dados de entrada
- [ ] Configurar CORS corretamente

---

# 📝 Notas Importantes
1. Ordenação da Agenda: O frontend já ordena automaticamente por data/horário (mais próximo primeiro). O backend pode fazer isso também para otimização.
2. IDs Únicos: Garantir que o backend gere UUIDs ou IDs únicos para cada registro.
3. Datas: Manter o formato `DD/MM/YYYY` para exibição e `ISO string` para armazenamento.
4. Senhas: NUNCA armazenar em texto puro. Usar bcrypt ou argon2.
5. JWT: Implementar expiração de token (sugestão: 1 hora) + refresh token.
