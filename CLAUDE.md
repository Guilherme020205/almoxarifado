# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Sistema web de almoxarifado (usuários/permissões, tipos de item, itens e empréstimos). Tudo vive em `projects/`:

- `projects/StockNode/` — backend (Node + TypeScript + Express 5 + Prisma ORM 8 / Postgres). Comandos, fluxo do banco e arquitetura estão em `projects/StockNode/CLAUDE.md`; rode os comandos `npm` dentro dessa pasta.
- `projects/docs/levantamento-requisitos-almoxarifado.md` — especificação de negócio (matriz de permissões por perfil, regras de itens e pedidos). É a fonte de verdade para regras ao implementar novas rotas.
- `projects/imagens/` — ícones SVG e logos (assets para o futuro frontend; ainda não há frontend no repo).

Código, comentários, mensagens de erro e docs são em português.
