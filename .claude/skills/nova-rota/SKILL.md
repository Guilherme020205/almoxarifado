---
name: nova-rota
description: Cria um novo endpoint no backend StockNode (controller + registro em routes.ts + teste vitest) seguindo os padrões do projeto. Use quando pedirem uma nova rota/endpoint/CRUD no backend, ex. "criar rota de itens", "adicionar PATCH /typeitem/:id".
---

# Nova rota no StockNode

Trabalhe dentro de `projects/StockNode/`.

1. **Regra de negócio**: confira em `projects/docs/levantamento-requisitos-almoxarifado.md` quais perfis podem usar a ação e as regras do recurso.
2. **Banco**: se precisar de model ou campo novo, pare e pergunte, a menos que o usuário já tenha pedido a mudança no banco.
3. **Controller**: crie `src/controller/<dominio>/<acao>Controller.ts` seguindo o modelo de `src/controller/typeItem/createTypeController.ts`:
   - classe em minúsculo com um único `async handle(req, res)`;
   - valida o body com `typeof` + `trim()`, erros via `throw new HttpError(...)`;
   - valida tamanho/formato dos campos conforme a documentação; se o limite não estiver definido, pergunte em vez de inventar;
   - checagem de nome duplicado reaproveita o padrão `ilike` de `src/utils/typeItem.ts`;
   - rotas com `:id`: confira se o registro existe (404) e se o usuário logado pode mexer nele;
   - nunca devolva `password` nem campos internos; use `.select(...)` só com os campos necessários;
   - escritas múltiplas que precisam ficar consistentes (estoque, empréstimo): avise o usuário antes de implementar; confirme na documentação do Prisma 8 como fazer transação, não invente a API.
4. **Rota**: registre em `src/routes.ts` com `new xController().handle`, usando `isAuthenticated`, `permissionLevelOne` ou `permissionLevelTwo` conforme a matriz.
5. **Teste**: crie `src/__tests__/controller/<dominio>/<acao>Controller.test.ts` copiando a estrutura de `createTypeController.test.ts` (`vi.mock` de `prisma/db`, `req`/`res` falsos). Cubra o sucesso e cada `HttpError`.
6. **Verificar**: rode a suíte completa (`npx vitest run`) e `npm run build`, já que uma rota nova mexe no `routes.ts` compartilhado.
7. Ao final, sugira rodar o agente `backend-reviewer`.
