---
name: nova-rota
description: Cria um novo endpoint no backend StockNode (controller + registro em routes.ts + teste vitest) seguindo os padrões do projeto. Use quando pedirem uma nova rota/endpoint/CRUD no backend, ex. "criar rota de itens", "adicionar PATCH /typeitem/:id".
---

# Nova rota no StockNode

Trabalhe dentro de `projects/StockNode/`.

1. **Regra de negócio**: confira em `projects/docs/levantamento-requisitos-almoxarifado.md` quais perfis podem usar a ação e as regras do recurso.
2. **Banco** (se precisar de model/campo novo): edite `src/prisma/contract.prisma` e rode `npm run contract:emit`.
3. **Controller**: crie `src/controller/<dominio>/<acao>Controller.ts` seguindo o modelo de `src/controller/typeItem/createTypeController.ts`:
   - classe em minúsculo com um único `async handle(req, res)`;
   - valida o body com `typeof` + `trim()`, erros via `throw new HttpError(...)`;
   - checagem de nome duplicado reaproveita o padrão `ilike` de `src/utils/typeItem.ts`.
4. **Rota**: registre em `src/routes.ts` com `new xController().handle`, usando `isAuthenticated`, `permissionLevelOne` ou `permissionLevelTwo` conforme a matriz.
5. **Teste**: crie `src/__tests__/controller/<dominio>/<acao>Controller.test.ts` copiando a estrutura de `createTypeController.test.ts` (`vi.mock` de `prisma/db`, `req`/`res` falsos). Cubra o sucesso e cada `HttpError`.
6. **Verificar**: `npx vitest run` e `npm run build`.
7. Ao final, sugira rodar o agente `backend-reviewer`.
