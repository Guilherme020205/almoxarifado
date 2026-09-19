# StockNode

Backend do sistema de almoxarifado (gestão de usuários/permissões, itens e empréstimos — ver [levantamento de requisitos](../docs/levantamento-requisitos-almoxarifado.md)).

## Stack

- Node.js + TypeScript
- Express
- cors, dotenv
- Prisma ORM 8 (Postgres)

## Setup

```bash
npm install
cp .env.example .env   # ajuste as variáveis se precisar
npm run dev
```

## Scripts

| Comando         | O que faz                                  |
| --------------- | ------------------------------------------- |
| `npm run dev`   | roda o servidor em watch mode (`tsx`)       |
| `npm run build` | compila TS -> `dist/`                       |
| `npm start`     | roda a build compilada (`dist/server.js`)   |

## Variáveis de ambiente

| Variável       | Descrição                       | Padrão |
| -------------- | -------------------------------- | ------ |
| `PORT`         | Porta do servidor HTTP           | `3000` |
| `DATABASE_URL` | String de conexão do PostgreSQL  | —      |

## Estrutura atual

```
src/
  server.ts            # bootstrap do Express (cors, json, rotas)
  routes.ts            # rotas (por enquanto só GET / -> health check)
  prisma/
    contract.prisma    # contrato Prisma — models/colunas/relações (editar aqui)
    contract.json       # gerado por `prisma contract emit` (commitar)
    contract.d.ts        # gerado por `prisma contract emit` (commitar)
    db.ts               # client Prisma (`import { db } from './src/prisma/db'`)
prisma.config.ts        # aponta o contrato e a conexão do banco
```

## Banco de dados (Prisma)

Fluxo pra criar ou alterar tabelas:

1. Editar os models em [`src/prisma/contract.prisma`](src/prisma/contract.prisma).
2. Rodar `npx prisma contract emit` (ou `npm run contract:emit`) — atualiza `contract.json`/`contract.d.ts` (tipagem/autocomplete). **Não toca no banco.**
3. Aplicar no banco de verdade:
   - Banco novo/vazio: `npx prisma db init` — cria tudo que o contrato descreve e já assina o banco.
   - Banco já existente, contrato mudou: `npx prisma db update` — aplica só a diferença (pede confirmação se for destrutivo).

Comandos extras úteis:

- `npx prisma db verify` — checa (sem alterar nada) se o banco bate com o contrato atual. Bom pra rodar antes de um deploy.
- `npx prisma db sign` — não migra nada, só marca/assina o banco como alinhado ao contrato. Usa isso quando o schema do banco já está correto (ex.: alguém migrou manualmente, ou ambiente de CI) e falta só registrar a assinatura.

## Status

Em desenvolvimento. Contrato Prisma inicial criado; ainda faltam autenticação e as rotas de negócio (usuários, itens, pedidos) descritas no levantamento de requisitos.
