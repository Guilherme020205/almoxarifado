---
paths:
  - "projects/StockNode/**"
---

# Cybersecurity — Regras de Segurança

## 1. Princípios gerais

- Considere segurança em toda implementação, correção ou alteração de código.
- Adote o princípio do menor privilégio.
- Não confie em dados recebidos do frontend, usuários ou serviços externos.
- Não presuma que uma funcionalidade está segura apenas porque está funcionando.
- Priorize soluções seguras e práticas reconhecidas de desenvolvimento.

## 2. Autenticação e autorização

- Verifique a autenticação em todas as rotas que exigem usuário autenticado.
- Verifique as permissões do usuário no backend, nunca confie apenas nas restrições do frontend.
- Não permita que usuários acessem ou alterem recursos de outros usuários sem autorização.
- Evite confiar em IDs, perfis ou permissões enviados pelo cliente.
- Garanta que operações administrativas sejam restritas aos perfis autorizados.
- Não exponha informações de autenticação em respostas ou logs.

## 3. Validação e tratamento de dados

- Valide todos os dados recebidos por APIs.
- Utilize validação de tipos, formatos, limites e campos obrigatórios.
- Proteja consultas ao banco contra SQL Injection.
- Evite utilizar dados externos diretamente em comandos, consultas ou operações sensíveis.
- Trate erros sem expor informações internas, stack traces ou detalhes da infraestrutura ao usuário.

## 4. Proteção de informações

- Nunca coloque senhas, tokens, chaves de API ou credenciais diretamente no código.
- Utilize variáveis de ambiente para informações sensíveis.
- Nunca exponha segredos no frontend ou em arquivos públicos.
- Não registre senhas, tokens ou dados sensíveis em logs.
- Armazene senhas utilizando algoritmos seguros de hash apropriados para senhas.

## 5. Segurança de APIs e banco de dados

- Implemente verificações de autorização em operações de leitura, criação, atualização e exclusão.
- Evite exposição excessiva de dados nas respostas das APIs.
- Utilize consultas parametrizadas ou os mecanismos seguros do ORM.
- Evite operações que permitam acesso indevido a registros por manipulação de identificadores.
- Avalie riscos de condições de corrida em operações que alteram estoque, empréstimos ou permissões.
- Utilize transações quando múltiplas operações precisarem manter a consistência dos dados.

## 6. Segurança no Frontend

- Não considere validações do frontend como mecanismos de segurança.
- Evite renderizar conteúdo não confiável como HTML.
- Proteja informações sensíveis armazenadas no navegador.
- Não exponha tokens, credenciais ou configurações privadas em variáveis públicas.
- Considere riscos de XSS, CSRF e redirecionamentos inseguros conforme a arquitetura utilizada.

## 7. Dependências e configurações

- Verifique possíveis vulnerabilidades em dependências quando houver alterações relevantes.
- Não instale pacotes desconhecidos sem avaliar sua necessidade e confiabilidade.
- Não desative mecanismos de segurança para contornar erros.
- Evite configurações permissivas em CORS, autenticação e acesso a recursos.

## 8. Revisão de segurança

- Ao implementar funcionalidades sensíveis, avalie os riscos de segurança envolvidos.
- Ao corrigir vulnerabilidades, procure também possíveis ocorrências do mesmo problema em outros pontos relacionados.
- Não ignore vulnerabilidades identificadas.
- Diferencie vulnerabilidades confirmadas de possíveis riscos que precisam de investigação.
- Informe os riscos encontrados e as medidas adotadas ao finalizar a tarefa.

## 9. Comportamento diante de riscos

- Não introduza vulnerabilidades conhecidas para facilitar a implementação.
- Se uma solicitação exigir enfraquecer um mecanismo de segurança, alerte o desenvolvedor antes de prosseguir.
- Explique os riscos e apresente alternativas mais seguras.
- Não considere uma revisão automatizada como garantia de segurança completa.
