---
paths:
  - "projects/StockNode/**"
---

# Regras do backend (StockNode)

Detalhes da arquitetura em `projects/StockNode/CLAUDE.md`. Ao mexer em arquivos do backend:

- Erros sempre com `throw new HttpError(status, msg)`; nunca `res.status(4xx)` manual.
- Validação à mão no controller (`typeof` + `trim()`); não adicionar biblioteca de validação.
- Permissões seguem a matriz de `projects/docs/levantamento-requisitos-almoxarifado.md`. Use `permissionLevelOne`/`permissionLevelTwo` do `routes.ts` antes de criar um grupo novo.
- Não criar novos models de banco de dados ou alterar qualquer parte do mesmo sem antes perguntar.
- Mudou `src/prisma/contract.prisma`? Rode `npm run contract:emit`, mas não rode `db init/db update` sem perguntar.
- Todo controller novo ganha um teste em `src/__tests__/` espelhando o caminho, com `vi.mock` de `prisma/db`.
- Antes de concluir garantir que os testes novos estejam passando.
- Nunca commitar `.env`.
