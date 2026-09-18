# StockNode

Backend do sistema de almoxarifado (gestão de usuários/permissões, itens e empréstimos — ver [levantamento de requisitos](../docs/levantamento-requisitos-almoxarifado.md)).

## Stack

- Node.js + TypeScript
- Express
- cors, dotenv

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

| Variável | Descrição            | Padrão |
| -------- | --------------------- | ------ |
| `PORT`   | Porta do servidor HTTP | `3000` |

## Estrutura atual

```
src/
  server.ts   # bootstrap do Express (cors, json, rotas)
  routes.ts   # rotas (por enquanto só GET / -> health check)
```

## Status

Em desenvolvimento. Ainda não há banco de dados, autenticação nem as rotas de negócio (usuários, itens, pedidos) descritas no levantamento de requisitos.
