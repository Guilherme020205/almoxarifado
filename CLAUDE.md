# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estrutura do repositório

- `StockNode/` — o backend (Node + TypeScript + Express 5 + Prisma ORM 8 sobre Postgres ≥15). Detalhes em [`StockNode/CLAUDE.md`](StockNode/CLAUDE.md).
- `docs/levantamento-requisitos-almoxarifado.md` — levantamento de requisitos (matriz de permissões por perfil, itens, fluxo de pedidos/empréstimos). É a fonte da verdade para regras de negócio ainda não implementadas.
- `imagens/` — ícones e logos para um futuro frontend.

Código, comentários, mensagens de erro e mensagens de commit são em português.

## Regras obrigatórias

- Não alterar regra de negócio no código sem confirmação explícita do usuário — pergunte antes.
- Não fazer alterações no banco de dados (`prisma db init/update/sign`, `npm run seed`, SQL direto) sem confirmação explícita do usuário — pergunte antes.
- Não fazer commit nem push sem confirmação explícita do usuário — pergunte antes.
- Não alterar a documentação (`docs/`, `README.md`) sem confirmação explícita do usuário — pergunte antes.
