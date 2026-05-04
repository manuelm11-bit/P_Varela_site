# Biblioteca Escolar — Registo de Presenças
### Agrupamento de Escolas de Montijo

Sistema web para registo de presenças e atividades na biblioteca escolar. Os alunos registam a sua presença através de um formulário simples, e a funcionária da biblioteca acede a um painel de administração para consultar, filtrar e exportar os registos.

---

## Requisitos do Servidor

Antes de instalar, confirmar que o servidor tem:

- **Node.js 20 ou superior** → https://nodejs.org
- **PostgreSQL 14 ou superior** → https://www.postgresql.org
- Acesso à internet durante a instalação (para descarregar dependências)

---

## Instalação (passo a passo)

### 1. Obter o código

```bash
git clone https://github.com/manuelmariamira/Library-Usage-Log
cd Library-Usage-Log
```

Ou descomprimir o ZIP e entrar na pasta.

### 2. Instalar as dependências

```bash
npm install
```

Este comando descarrega automaticamente todos os pacotes necessários. Demora 1-2 minutos.

### 3. Configurar as variáveis de ambiente

Criar um ficheiro chamado `.env` na raiz do projeto (na mesma pasta que o `package.json`):

```
DATABASE_URL=postgres://utilizador:password@localhost:5432/nome_da_base
SESSION_SECRET=uma_frase_longa_e_secreta_qualquer
PORT=5000
```

Ver o ficheiro `.env.example` incluído no projeto para referência.

> **Importante:** Substituir os valores pelos dados reais da base de dados PostgreSQL do servidor.

### 4. Criar as tabelas na base de dados

```bash
npm run db:push
```

Este comando cria automaticamente todas as tabelas necessárias na base de dados. Só é preciso correr uma vez.

### 5. Compilar o projeto

```bash
npm run build
```

Gera os ficheiros optimizados para produção na pasta `dist/`.

### 6. Arrancar o servidor

```bash
npm run start
```

O site fica disponível em `http://endereço-do-servidor:5000`

---

## Como Atualizar (versões futuras)

Quando houver uma nova versão do código:

```bash
git pull
npm install
npm run db:push
npm run build
npm run start
```

---

## Credenciais Iniciais

Quando o servidor arranca pela primeira vez, é criado automaticamente um utilizador administrador:

| Campo | Valor |
|-------|-------|
| Utilizador | `Biblioteca025` |
| Password | `Pa$$w0rd` |

> **Recomendação:** Alterar a password após a primeira instalação, editando o ficheiro `server/routes.ts` (linha 57).

O **código de acesso público** para os alunos acederem ao formulário de registo é:

```
Varela026
```

Para alterar este código, editar o ficheiro `client/src/pages/AccessPage.tsx` e procurar `Varela026`.

---

## Estrutura do Projeto

```
├── client/          Frontend (React + Vite)
│   └── src/
│       ├── pages/   Páginas da aplicação
│       └── components/  Componentes reutilizáveis
├── server/          Backend (Node.js + Express)
│   ├── index.ts     Ponto de entrada do servidor
│   ├── routes.ts    Rotas da API
│   ├── storage.ts   Acesso à base de dados
│   └── db.ts        Configuração da ligação PostgreSQL
├── shared/          Tipos e esquemas partilhados
│   └── schema.ts    Definição das tabelas
├── script/          Scripts de build
└── .env.example     Modelo de configuração
```

---

## Funcionalidades

- Formulário de registo de presença (nome, ano, turma, atividade)
- Página protegida por código de acesso
- Painel de administração com login
- Filtros por data, intervalo de datas e mês
- Calendário interativo para seleção de datas
- Exportação para **Excel (.xlsx)** e **CSV**
- Confirmação de eliminação de registos

---

## Resolver Problemas Comuns

**O servidor não arranca:**
- Verificar se o Node.js está instalado: `node --version`
- Verificar se o ficheiro `.env` existe e tem o `DATABASE_URL` correto

**Erro de base de dados:**
- Confirmar que o PostgreSQL está a correr
- Confirmar que o utilizador e password no `DATABASE_URL` têm permissões
- Correr `npm run db:push` para garantir que as tabelas existem

**Porta já em uso:**
- Alterar `PORT=5000` no `.env` para outro número (ex: `PORT=3000`)

**Login do admin não funciona:**
- Correr `npm run db:push` para garantir que a tabela `users` existe
- Reiniciar o servidor — o utilizador admin é criado automaticamente no arranque

---

## Tecnologias Utilizadas

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React 18, Vite, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express 5 |
| Base de dados | PostgreSQL, Drizzle ORM |
| Exportação | ExcelJS (xlsx), CSV |
| Autenticação | express-session |
