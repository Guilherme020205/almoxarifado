# CLAUDE.md — StockNode (backend)

Node + TypeScript + Express 5 + Prisma ORM 8 sobre Postgres ≥15. Rode os comandos dentro desta pasta.

## Comandos

```bash
npm run dev                 # tsx em watch mode, carrega o .env via --env-file
npm run build               # tsc -p tsconfig.build.json -> dist/
npm start                   # node dist/server.js
npm test                    # vitest (watch mode); `npx vitest run` para rodar uma vez só
npx vitest run src/__tests__/controller/user/editUserController.test.ts   # um arquivo
npx vitest run -t "nome do teste"                                         # um teste pelo nome
npm run seed                # cria/atualiza o usuário ROOT a partir de rootuser/rootpass do .env
npm run contract:emit       # regera src/prisma/contract.json + contract.d.ts
```

O `server.ts` lança erro ao iniciar se `JWT_SECRET` ou `DATABASE_URL` não estiverem definidos (ver `.env.example`).

## Banco de dados (fluxo de "contrato" do Prisma 8 — não é o fluxo clássico schema/migrate do Prisma 5/6)

1. Editar os models em `src/prisma/contract.prisma`.
2. `npx prisma contract emit` — regera `contract.json`/`contract.d.ts` (commitar os dois; eles geram a tipagem do client). Não mexe no banco.
3. Aplicar: `npx prisma db init` (banco vazio) ou `npx prisma db update` (banco existente). `npx prisma db verify` checa divergências sem alterar nada.

Client: `import { db } from "../prisma/db"`, consultas via `db.orm.public.<Model>` — ex.: `.where({ id }).first()`, `.where((u) => u.name.ilike(p))`, `.select(...).all()`, `.create({...})`, `.where(...).update(data)`. Violações de unique do Postgres chegam como `err.sqlState === "23505"` (convertidas em 409 no `server.ts`).

## Arquitetura

- `src/routes.ts` registra todas as rotas. Uma classe por endpoint em `src/controller/<dominio>/<acao>Controller.ts`, nome da classe em minúsculo, com um único `async handle(req, res)`, registrada como `new xController().handle`.
- Erros: controllers/middlewares só fazem `throw new HttpError(status, msg)` (o Express 5 repassa os throws assíncronos); o error handler do `server.ts` transforma em `{ message }`. Não use `res.status(4xx)` manualmente.
- Autenticação: `POST /login` (com rate limit) devolve um JWT de 24h `{ sub: userId, profile }`. O `isAuthenticated` relê o usuário do banco a cada requisição, então desativação/troca de perfil valem na hora, e `res.locals.user.profile` vem do banco, não do token. `requireProfile(...perfis)` deve vir depois dele. Os grupos `permissionLevelOne`/`permissionLevelTwo` no `routes.ts` juntam os dois.
- Perfis são um enum fixo (`PROFILES` em `src/types/index.ts`, espelhado no `contract.prisma`): `ROOT`, `SUPERVISOR`, `ALMOXARIFE_CHEFE`, `ALMOXARIFE_AUXILIAR`. Quando a regra depende de quem está sendo editado (ex.: `editUserController`), a rota só exige login e o controller aplica as regras.
- Regras do ROOT: o único usuário ROOT é identificado pelo `rootuser` do `.env` (não é um email de verdade), é criado só pelo `npm run seed` e nunca pode ser criado/editado pela API. Todos os outros perfis precisam de um email real. Emails são sempre salvos/comparados via `normalizeEmail` (trim + minúsculas).
- Senhas: `hashPassword`/`verifyPassword` em `src/utils/user.ts` usam scrypt do `node:crypto` (`salt:hash`) — sem dependência de bcrypt.
- A validação é feita à mão nos controllers (checagens com `typeof` + `trim()`); sem biblioteca de validação. Checagens de unicidade sem diferenciar maiúsculas usam `ilike` com `\ % _` escapados (ver `utils/typeItem.ts`).

## Testes

Vitest, em `src/__tests__/` espelhando a estrutura de `src/`. Os testes fazem `vi.mock` do módulo `prisma/db` com uma cadeia falsa de `db.orm.public.<Model>` e chamam `new xController().handle(req, res)` direto, com `req`/`res` de mentira — não precisa de banco nem de servidor HTTP. Utils compartilhados (ex.: `isTypeNameItemTaken`) rodam de verdade sobre a cadeia mockada.
