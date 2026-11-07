# CLAUDE.md

Este arquivo fornece orientações ao Claude Code
para trabalhar neste repositório.

## Contexto do projeto

Sistema web de almoxarifado (usuários, permissões,
tipos de item, itens e empréstimos).

Tudo está organizado em `projects/`:

- `projects/StockNode/`: backend Node.js, TypeScript,
  Express 5, Prisma e PostgreSQL.
- `projects/docs/`: documentação e requisitos do negócio.
- `projects/imagens/`: logos e ícones SVG.

Os comandos npm devem ser executados dentro
da pasta correspondente ao projeto.

Código, comentários, mensagens de erro e documentação
devem ser escritos em português.

## Instruções de trabalho

- Analise a estrutura existente antes de modificar arquivos.
- Respeite a arquitetura e os padrões existentes.
- Não tome decisões de negócio por conta própria.
- Consulte as regras específicas disponíveis em `.claude/rules/`.
- Informe alterações e resultados ao finalizar as tarefas.

## Regras obrigatórias

As regras abaixo devem ser respeitadas durante todo o desenvolvimento:

- Cybersecurity `.claude/rules/cybersecurity.md`
- Git e commits: `.claude/rules/git.md`
- Qualidade e testes: `.claude/rules/testing.md`
- Documentação e regras de negócio: `.claude/rules/business-rules.md`
