# Frontend - Resolve Mais

Aplicação web do projeto **Resolve Mais**, construída com `React` e `Vite`. Este repositório contém a interface pública, autenticação, área do cliente, área da empresa e fluxo de atendimento.

Também inclui a funcionalidade de leitura pontuada por IA para empresas, usada para gerar insights operacionais com base nos dados mais recentes disponíveis.

## Stack

- `React`
- `Vite`
- `React Router`
- `Axios`
- `Styled Components`
- `React Hook Form`
- `Yup`

## Pré-requisitos

- `Node.js` 22 ou superior
- `npm`
- backend do projeto em execução

## Passo a passo para iniciar

### 1. Entrar na pasta do frontend

```powershell
cd frontend
```

### 2. Instalar as dependências

```powershell
npm install
```

### 3. Criar o arquivo de ambiente

```powershell
Copy-Item .env.example .env
```

### 4. Conferir as variáveis do `.env`

Use este conteúdo como base:

```env
VITE_API_URL=http://localhost:3001/api
VITE_PORT=3000
```

- `VITE_API_URL`: URL base da API do backend
- `VITE_PORT`: porta usada pelo servidor do Vite em desenvolvimento

### 5. Garantir que o backend está ativo

Antes de subir o frontend, o backend deve estar rodando em `http://localhost:3001` ou na mesma URL configurada em `VITE_API_URL`.

### 6. Iniciar o servidor de desenvolvimento

```powershell
npm run dev
```

### 7. Acessar a aplicação

Com o `.env.example` atual, o frontend sobe em:

```text
http://localhost:3000
```

## Ordem correta para subir o projeto completo

1. Inicie o banco SQL Server.
2. Inicie o backend.
3. Inicie o frontend.
4. Acesse `http://localhost:3000`.

## Scripts disponíveis

- `npm run dev`: inicia o Vite em modo desenvolvimento
- `npm run build`: gera a build de produção
- `npm run preview`: abre uma prévia local da build
- `npm run lint`: executa o ESLint

## Rotas principais

### Públicas

- `/`
- `/landing`
- `/team`
- `/empresa`
- `/empresa/:companyId/dashboard`
- `/empresas/:companyId/dashboard`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Cliente

- `/cliente/home`
- `/cliente/open-ticket`
- `/cliente/pending-tickets`
- `/cliente/closed-tickets`
- `/cliente/configuracoes`
- `/cliente/chatbot`

### Funcionário

- `/funcionario/home`
- `/funcionario/configuracoes`
- `/funcionario/atendimentos`
- `/funcionario/CompanyInfo`

### Empresa

- `/empresa/home`
- `/empresa/insights`
- `/empresa/chamados`
- `/empresa/configuracoes`
- `/empresa/assuntos`
- `/empresa/usuario`
- `/empresa/administradores`

## Funcionalidade de insights com IA

- A tela `/empresa/insights` permite gerar uma leitura da empresa sob demanda.
- A análise destaca sinais operacionais, riscos e ações sugeridas com apoio de IA.
- O funcionamento depende da configuração de IA no backend.

## Integração com o backend

O frontend usa `axios` em `src/services/api.js` com `VITE_API_URL` como `baseURL`.

Também existem fluxos em tempo real que dependem do backend:

- chatbot com stream em `/api/chatbot/message/stream`
- eventos de tickets em `/api/tickets/:ticketId/events/stream`

## Problemas comuns

- Se login, cadastro ou tickets falharem, revise `VITE_API_URL`.
- Se o navegador bloquear chamadas, valide o `CORS_ALLOWED_ORIGINS` do backend.
- Se a porta `3000` já estiver em uso, altere `VITE_PORT` no `.env`.
