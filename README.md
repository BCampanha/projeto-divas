# projeto-divas
Sistema web para divulgação institucional e apoio organizacional da ONG Projeto Divas, a fim de ampliar sua visibilidade e facilitar o acesso de pacientes, voluntários e comunidade às informações e serviços oferecidos.


# 📌 Visão Geral do mock

Foi desenvolvido um backend simulado (**mock**) utilizando `localStorage` para testes de navegação e usabilidade do frontend.

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

# 🔐 Arquivo principal: `/js/auth-mock.js`

## Funções disponíveis

```js
AuthMock.login(email, senha)
AuthMock.cadastro(nome, email, telefone, senha)
AuthMock.getUsuarioLogado()
AuthMock.getUsuarios()
AuthMock.salvarLembrete(lembrete)
AuthMock.getLembretes()
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

| Método | Endpoint | Função |
|---|---|---|
| `POST` | `/api/login` | Autenticar usuário |
| `POST` | `/api/cadastro` | Cadastrar usuário |
| `GET` | `/api/usuario/:id` | Buscar dados do usuário |
| `PUT` | `/api/usuario/:id` | Atualizar usuário |
| `GET` | `/api/lembretes` | Listar lembretes |
| `POST` | `/api/lembretes` | Criar lembrete |
| `DELETE` | `/api/lembretes/:id` | Excluir lembrete |

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

## 📅 Lembrete

```js
{
  id: string,
  usuarioId: string,
  data: string, // DD/MM/YYYY
  horario: string, // HH:mm
  titulo: string,
  descricao: string,
  etiqueta: 'medicacao' | 'consulta' | 'exame' | 'evento',
  criadoEm: ISO date string
}
```

---

# 🔧 Arquivos que podem precisar de ajustes

```bash
/js/auth-mock.js   ← PRINCIPAL (substituir por auth-api.js)
/js/login.js       ← Ajustar tratamento de erros
/js/cadastro.js    ← Ajustar tratamento de erros
/js/agenda.js      ← Buscar lembretes da API
/js/perfil.js      ← Buscar dados do usuário da API
```

---

# 🎯 Checklist para integração

- [ ] Configurar URL base da API
- [ ] Implementar autenticação (JWT ou similar)
- [ ] Substituir `login()` por chamada à API
- [ ] Substituir `cadastro()` por chamada à API
- [ ] Substituir `getLembretes()` por chamada à API
- [ ] Substituir `salvarLembrete()` por chamada à API
- [ ] Testar fluxo completo:
  - Login
  - Agenda
  - Perfil
- [ ] Implementar refresh token (se necessário)
- [ ] Adicionar tratamento de erros `401` e `403`
- [ ] Testar em produção
