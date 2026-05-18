# Projeto Divas

Sistema web fullstack para a ONG Projeto Divas — organização de acolhimento e apoio a mulheres em tratamento oncológico.

---

## Tecnologias

**Frontend**
- HTML5, CSS3, JavaScript vanilla
- Service Worker (PWA)

**Backend**
- Java 17 + Spring Boot 3.3.5
- Spring Security + JWT
- Spring Data JPA + Hibernate
- Spring Mail (Gmail SMTP)
- Maven

**Banco de dados**
- MySQL (hospedado na Aiven Cloud)

---

## Funcionalidades

| Funcionalidade | Beneficiária | Admin |
|---|---|---|
| Cadastro e login com JWT | ✅ | ✅ |
| Agenda pessoal (consultas, exames, medicações) | ✅ | — |
| Visualizar eventos públicos da ONG | ✅ | ✅ |
| Salvar evento público na agenda pessoal | ✅ | — |
| Publicar e excluir eventos públicos | — | ✅ |
| Recuperação de senha por e-mail | ✅ | ✅ |
| Perfil do usuário | ✅ | ✅ |

---

## Como rodar localmente

### Pré-requisitos
- Java 17+
- Node.js (para servir o frontend)

### 1. Configure as variáveis de ambiente

```bash
export DB_URL="jdbc:mysql://SEU_HOST:PORTA/defaultdb?ssl-mode=REQUIRED"
export DB_USERNAME="seu_usuario"
export DB_PASSWORD="sua_senha"
export MAIL_USERNAME="seu@gmail.com"
export MAIL_PASSWORD="sua_senha_de_app"
export JWT_SECRET="sua_chave_jwt_secreta"
```

### 2. Suba o backend

```bash
cd projeto-divas-backend
./mvnw spring-boot:run
```

Backend disponível em: `http://localhost:8080`

### 3. Suba o frontend

```bash
npx serve . --listen 3000
```

Frontend disponível em: `http://localhost:3000`

---

## Endpoints da API

### Usuários
| Método | Endpoint | Autenticação | Descrição |
|---|---|---|---|
| POST | `/usuarios/criar` | Pública | Cadastrar nova beneficiária |
| POST | `/usuarios/login` | Pública | Login, retorna JWT |
| GET | `/usuarios/{id}` | Autenticado | Buscar dados do usuário |
| PUT | `/usuarios/atualizar/{id}` | Autenticado | Atualizar dados |
| POST | `/usuarios/esqueci-senha` | Pública | Enviar código de recuperação por e-mail |
| POST | `/usuarios/resetar-senha` | Pública | Redefinir senha com código recebido |

### Agendamentos (lembretes pessoais)
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/agendamentos` | Listar agendamentos do usuário logado |
| POST | `/agendamentos` | Criar lembrete (consulta, exame, medicação) |
| DELETE | `/agendamentos/{id}` | Excluir lembrete |

### Eventos Públicos
| Método | Endpoint | Autenticação | Descrição |
|---|---|---|---|
| GET | `/eventos-divas` | Autenticado | Listar todos os eventos da ONG |
| POST | `/eventos-divas` | Admin | Publicar novo evento |
| DELETE | `/eventos-divas/{id}` | Admin | Excluir evento |
| POST | `/eventos-divas/{id}/salvar-na-agenda/{idUsuario}` | Beneficiária | Salvar evento na agenda pessoal |

### Localidades
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/localidades` | Listar localidades cadastradas |
| POST | `/localidades` | Criar nova localidade |

---

## Estrutura do projeto

```
projeto-divas/
├── index.html               # Página inicial + login
├── agenda.html              # Agenda da beneficiária
├── admin.html               # Painel administrativo
├── perfil.html              # Perfil do usuário
├── cadastro-agenda.html     # Cadastro de nova conta
├── contribuicao.html        # Página de contribuição
├── css/                     # Estilos por página
├── js/
│   ├── api.js               # Cliente HTTP — todos os endpoints
│   ├── login.js             # Login + recuperação de senha
│   ├── cadastro.js          # Cadastro de usuário
│   ├── interacoes.js        # Agenda da beneficiária
│   ├── admin.js             # Painel do administrador
│   ├── perfil.js            # Dados do perfil
│   ├── calendario.js        # Componente de calendário
│   ├── atividades.js        # Galeria de atividades
│   └── informacoes.js       # Seção de informações
├── images/                  # Imagens e ícones
├── fonts/                   # Fontes customizadas
└── projeto-divas-backend/   # Aplicação Spring Boot
    └── src/main/java/com/ong/divas/
        ├── controllers/     # REST controllers
        ├── services/        # Regras de negócio
        ├── entities/        # Entidades JPA
        ├── dto/             # Objetos de transferência
        ├── repository/      # Repositórios Spring Data
        ├── security/        # JWT + filtros
        └── config/          # Configurações de segurança e CORS
```

---

## Variáveis de ambiente (produção)

| Variável | Descrição |
|---|---|
| `DB_URL` | URL completa de conexão com o MySQL |
| `DB_USERNAME` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `MAIL_USERNAME` | E-mail remetente (Gmail) |
| `MAIL_PASSWORD` | Senha de app do Gmail |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT |
