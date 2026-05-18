# 💖 Projeto Divas

Sistema web fullstack desenvolvido para a ONG **Projeto Divas**, com o objetivo de ampliar a visibilidade institucional da organização e facilitar o acesso de pacientes, voluntários e comunidade às informações e serviços oferecidos.

---

## ✨ Visão Geral

O Projeto Divas foi desenvolvido para oferecer uma experiência digital acessível, organizada e segura para mulheres em tratamento oncológico.

A plataforma permite:

- 📅 Organização da rotina médica
- 💖 Participação em eventos da ONG
- 🔐 Autenticação segura
- 👩‍💼 Gerenciamento administrativo
- 📩 Recuperação de senha por e-mail

---

# 📌 Status Atual

- ✅ Frontend 100% funcional
- ✅ Sistema de autenticação mockado
- ✅ Agenda com lembretes pessoais
- ✅ Painel administrativo funcional
- ✅ Eventos públicos para pacientes
- ✅ Estrutura pronta para integração com API REST

---

# 🛠 Tecnologias Utilizadas

## 🎨 Frontend
- HTML5
- CSS3
- JavaScript Vanilla
- Service Worker (PWA)

## ⚙️ Backend
- Java 17
- Spring Boot 3.3.5
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- Spring Mail
- Maven

## 🗄 Banco de Dados
- MySQL
- Aiven Cloud

---

# 🚀 Funcionalidades

| Funcionalidade | Paciente | Admin |
|---|---|---|
| Cadastro e login | ✅ | ✅ |
| Autenticação JWT | ✅ | ✅ |
| Agenda pessoal | ✅ | — |
| Consultas, exames e medicações | ✅ | — |
| Eventos públicos | ✅ | ✅ |
| Publicação de eventos | — | ✅ |
| Exclusão de eventos | — | ✅ |
| Recuperação de senha | ✅ | ✅ |
| Perfil do usuário | ✅ | ✅ |

---

# 🔐 Autenticação e Autorização

O sistema possui dois níveis de acesso:

| Tipo | Permissões |
|---|---|
| 👩 Paciente | Agenda pessoal, lembretes e perfil |
| 👨‍💼 Admin | Gerenciamento de eventos e painel administrativo |

A autenticação foi estruturada utilizando JWT, garantindo segurança e separação de permissões entre pacientes e administradores.

---

# 📢 Eventos Públicos

Os eventos publicados pelo administrador ficam disponíveis para todos os pacientes dentro da agenda integrada do sistema.

## 📌 Diferença entre Lembretes e Eventos

| Característica | Lembrete Pessoal | Evento Público |
|---|---|---|
| Quem cria | Paciente | Admin |
| Quem visualiza | Apenas o criador | Todos os pacientes |
| Pode excluir | Criador | Apenas Admin |
| Finalidade | Organização pessoal | Eventos da ONG |

---

# 📂 Estrutura do Projeto

```bash
projeto-divas/
│
├── index.html
├── agenda.html
├── admin.html
├── perfil.html
├── cadastro-agenda.html
├── contribuicao.html
│
├── css/
│
├── js/
│   ├── auth-mock.js
│   ├── interacoes.js
│   ├── atividades.js
│   ├── filtros.js
│   ├── login.js
│   ├── cadastro.js
│   ├── agenda.js
│   ├── admin.js
│   └── perfil.js
│
├── images/
├── fonts/
│
└── projeto-divas-backend/
```

---

# 🔄 Integração com API Real

O frontend foi estruturado para facilitar a migração do backend mockado para uma API REST real.

## ✅ Método Recomendado

Criar um novo arquivo:

```bash
/js/auth-api.js
```

E manter os mesmos métodos do:

```bash
/js/auth-mock.js
```

Depois alterar no HTML:

### Antes
```html
<script src="./js/auth-mock.js"></script>
```

### Depois
```html
<script src="./js/auth-api.js"></script>
```

---

# 📡 Endpoints Necessários

## 👤 Usuários

| Método | Endpoint | Função |
|---|---|---|
| POST | `/api/login` | Login |
| POST | `/api/cadastro` | Cadastro |
| GET | `/api/usuario/me` | Usuário logado |
| PUT | `/api/usuario/:id` | Atualizar usuário |
| GET | `/api/usuarios` | Listar usuários |

---

## 📅 Lembretes

| Método | Endpoint | Função |
|---|---|---|
| GET | `/api/lembretes` | Listar lembretes |
| POST | `/api/lembretes` | Criar lembrete |
| DELETE | `/api/lembretes/:id` | Excluir lembrete |

---

## 🤝 Eventos Públicos

| Método | Endpoint | Função |
|---|---|---|
| GET | `/api/eventos-publicos` | Listar eventos |
| POST | `/api/eventos-publicos` | Criar evento |
| PUT | `/api/eventos-publicos/:id` | Editar evento |
| DELETE | `/api/eventos-publicos/:id` | Excluir evento |

---

## 🗓 Agenda Consolidada

| Método | Endpoint | Função |
|---|---|---|
| GET | `/api/agenda` | Retorna lembretes + eventos |

---

# 🔒 Segurança

O sistema utiliza:

- 🔐 JWT Authentication
- 🔑 Controle de permissões
- 🛡 Spring Security
- 🔒 Hash de senha com bcrypt/argon2
- ⏳ Expiração de token
- ♻️ Refresh Token
- ✅ Validação de dados

---

# 🎯 Checklist de Integração

## 🔐 Auth & Usuários
- [ ] Configurar URL da API
- [ ] Implementar JWT
- [ ] Criar middleware de autenticação
- [ ] Criar middleware de autorização

## 📝 Lembretes
- [ ] CRUD de lembretes
- [ ] Validação do dono do recurso

## 🤝 Eventos
- [ ] CRUD de eventos públicos
- [ ] Restrição apenas para admins

## 🗓 Agenda
- [ ] Endpoint consolidado
- [ ] Ordenação por data/hora

## ✅ Testes
- [ ] Fluxo completo de login
- [ ] Fluxo de lembretes
- [ ] Fluxo administrativo
- [ ] Testes de permissão

---

# 🚀 Produção

Recomendações para produção:

- 🌐 HTTPS obrigatório
- 🔒 Variáveis de ambiente seguras
- ⚡ Rate limiting
- 📄 Logs de erro
- 💾 Backup automático
- 🔐 Configuração correta de CORS

---

# 💡 Futuras Melhorias

- 📱 Aplicativo mobile
- 🔔 Notificações push
- 📊 Dashboard administrativo
- 📆 Integração com Google Calendar
- 💬 Área de apoio psicológico online

---

---

# 💖 Projeto desenvolvido com propósito social
