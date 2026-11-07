# Levantamento de Requisitos — Sistema de Almoxarifado

## 1. Visão Geral

Sistema web para gestão de almoxarifado, permitindo controle de usuários e permissões, cadastro de itens e tipos de itens, e o fluxo de empréstimo (saída/devolução) de materiais.

**Perfis de acesso do sistema (fixos, definidos em código — não é possível criar, editar nem excluir perfis):**

- Root
- Supervisor
- Almoxarife Chefe
- Almoxarife Auxiliar

---

## 2. Módulo: Usuários e Permissões

### 2.1 Permissões

Os perfis de acesso são **fixos** (enum no sistema, não uma entidade cadastrável). Não existe tela de cadastro, edição ou exclusão de permissões — o conjunto de ações liberadas para cada um dos 4 perfis é definido em código, conforme a matriz abaixo.

**Lista de ações do sistema (usadas internamente para checagem de permissão):**

| Grupo               | Ação                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| Usuários            | `usuario.criar`, `usuario.editar`, `usuario.inativar`, `usuario.deletar`     |
| Tipo de Item        | `tipoItem.criar`, `tipoItem.editar`, `tipoItem.inativar`, `tipoItem.deletar` |
| Item                | `item.criar`, `item.editar`, `item.inativar`, `item.deletar`                 |
| Pedido (empréstimo) | `pedido.criar`, `pedido.editar`                                              |

_(Lista inicial — pode crescer conforme novas telas/ações forem definidas. Alterações nessa matriz são feitas em código, não pelo usuário do sistema.)_

**Matriz de permissões dos perfis:**

| Ação                                           | Root |     Supervisor     | Almoxarife Chefe | Almoxarife Auxiliar |
| ---------------------------------------------- | :--: | :----------------: | :--------------: | :-----------------: |
| `usuario.criar`                                |  ✅  |         ✅         |        ❌        |         ❌          |
| `usuario.editar` — outros usuários             |  ✅  | ✅ (exceto o Root) |        ❌        |         ❌          |
| `usuario.editar` — o próprio usuário           |  ❌  |         ✅         |        ✅        |         ✅          |
| `usuario.inativar`                             |  ✅  |         ✅         |        ❌        |         ❌          |
| `usuario.deletar`                              |  ✅  |         ✅         |        ❌        |         ❌          |
| `tipoItem.*`                                   |  ✅  |         ✅         |        ✅        |         ❌          |
| `item.criar` / `item.editar` / `item.inativar` |  ✅  |         ✅         |        ✅        |         ✅          |
| `item.deletar`                                 |  ✅  |         ✅         |        ✅        |         ❌          |
| `pedido.criar` / `pedido.editar`               |  ✅  |         ✅         |        ✅        |         ✅          |

### 2.2 Usuários

**História de usuário**

> Como administrador, quero cadastrar os usuários do sistema associando um perfil de permissão, e poder inativá-los quando saem da empresa, sem perder o histórico de pedidos vinculados a eles.

**Ações:** Cadastrar, editar (inclui inativar), excluir.

**Campos:**
| Campo | Tipo | Observação |
|---|---|---|
| Nome | Texto | |
| Email | Texto | Login do sistema |
| Senha | Texto (hash) | |
| Perfil | Enum | Um dos 4 perfis fixos (root, supervisor, almoxarife chefe, almoxarife auxiliar) |

**Regras de negócio:**

- RN02: Usuário criado só pode ser deletado caso não tenha nenhum pedido vinculado a ele (em qualquer status, inclusive Cancelado). Somente Root e Supervisor podem deletar usuários. Com histórico, a saída é inativar (RN30).
- RN03: Usuário inativo não deve conseguir logar no sistema.
- RN04: Usuário inativo continua aparecendo normalmente no histórico dos pedidos já feitos por ele (não é removido nem ocultado dos registros antigos).
- RN23: Somente Root e Supervisor cadastram usuários. Nenhum usuário pode ser cadastrado com o perfil Root.
- RN24: Edição de outros usuários (campos: nome, email, senha, perfil, ativo):
  - **Root** edita qualquer usuário e todos os campos.
  - **Supervisor** edita qualquer usuário, exceto o Root, e todos os campos — inclusive redefinir a senha (ex.: senha esquecida) e promover/rebaixar outros usuários a Supervisor.
  - **Almoxarife Chefe** e **Almoxarife Auxiliar** não editam outros usuários.
- RN25: Todo usuário (exceto o Root, ver RN27) pode editar o próprio nome, email e senha. Ninguém pode alterar o próprio perfil nem se inativar.
- RN26: Só Root e Supervisor alteram perfil (de outros usuários). Ninguém pode receber o perfil Root (validado no backend, mesmo sem a opção no front).
- RN27: O Root é único e de uso exclusivo da equipe de suporte/desenvolvimento (não é entregue ao cliente). É criado pelo seed com login e senha definidos no `.env` e **não pode ser editado pelo sistema por ninguém, nem por ele mesmo** (nome, email, senha, perfil, ativo) — o front não exibe a opção de edição para ele. Para trocar login/senha do Root, o suporte altera o `.env` e roda o seed de novo, que sobrescreve email e senha e o reativa.
- RN28: Ao alterar a senha, a nova senha deve ser digitada duas vezes (campo de confirmação).
- RN29: O email é único e não diferencia maiúsculas de minúsculas (`Joao@x.com` e `joao@x.com` são o mesmo login).
- RN30: Regra geral de exclusão (usuário, tipo de item, item): só se exclui o que **não tem histórico** vinculado (RN02, RN06, RN09). Se tiver, a exclusão é recusada (HTTP 409) com mensagem orientando a inativar. A trava também é garantida no banco pelas chaves estrangeiras (sem `onDelete: Cascade`), então nunca se perde histórico mesmo se a checagem da aplicação falhar.
- RN31: Todo usuário logado (qualquer perfil) pode listar/consultar usuários — usado na tela "Usuário (perfil próprio)" e na escolha de quem recebe o pedido. A listagem nunca retorna a senha e nunca inclui o Root (RN27).

---

## 3. Módulo: Armazém

### 3.1 Tipo de Item

**História de usuário**

> Como almoxarife, quero organizar os itens por tipo (ex.: eletrônico, tinta), podendo inativar tipos que não uso mais sem perder o histórico dos itens já cadastrados nesse tipo.

**Ações:** Cadastrar, editar, inativar, excluir.

**Campos:**
| Campo | Tipo | Observação |
|---|---|---|
| Nome do tipo | Texto | Obrigatório, único (RN32) |
| Descrição | Texto | Obrigatória |

**Regras de negócio:**

- RN05: Ao inativar um tipo, os itens vinculados a ele deixam de aparecer nas listagens.
- RN06: Só é possível excluir um tipo se não houver nenhum item vinculado a ele (ativo ou inativo). Com itens vinculados, a saída é inativar (RN30).
- RN32: O nome do tipo é único, sem diferenciar maiúsculas de minúsculas e ignorando espaços nas pontas (`Papelaria`, `papelaria` e ` Papelaria ` são o mesmo tipo). Nome repetido é recusado com HTTP 409. A checagem é feita na aplicação e o banco tem `@unique` no nome como segunda trava (pega cadastros simultâneos com o mesmo nome exato).
- RN33: Todo tipo é criado ativo; inativar é uma ação de edição. Nome e descrição são obrigatórios (só espaços conta como vazio).

### 3.2 Item

**História de usuário**

> Como almoxarife, quero cadastrar os itens do estoque com nome, tipo e quantidades, para saber o que está disponível e o que está emprestado a qualquer momento.

**Ações:** Cadastrar, editar, inativar, excluir.

**Campos:**
| Campo | Tipo | Observação |
|---|---|---|
| Nome do item | Texto | Único (RN34) |
| Tipo do item | Referência | Vínculo com Tipo de Item |
| Quantidade em estoque | Número | Disponível para novo pedido |
| Quantidade emprestada | Número | Calculado a partir dos pedidos em aberto |

**Regras de negócio:**

- RN07: Item inativo não aparece na lista de itens disponível dentro do modal de novo pedido.
- RN08: Item inativo continua aparecendo na listagem geral de itens (a lista de itens mostra inativos).
- RN09: Item só pode ser excluído se nunca foi usado em nenhum pedido (em qualquer status, inclusive Cancelado) — a exclusão serve para corrigir cadastros feitos por engano. Item com histórico de pedidos só pode ser inativado — mesmo com unidades emprestadas em pedidos ativos. Um item inativo continua podendo ser devolvido normalmente (aparece nos pedidos já existentes), só não pode ser escolhido em pedidos novos. A quantidade emprestada continua sendo controlada normalmente até zerar.
- RN34: O nome do item é único em todo o sistema (não só dentro do tipo), com a mesma regra da RN32: sem diferenciar maiúsculas/minúsculas, ignorando espaços nas pontas, HTTP 409 se repetido, e `@unique` no banco como segunda trava.

---

## 4. Módulo: Pedidos (Empréstimo)

### 4.1 Home

**História de usuário**

> Como usuário do sistema, ao entrar na home eu quero ver de imediato a lista de pedidos e ter acesso rápido para criar um novo pedido e navegar para as demais áreas do sistema.

**Elementos da Home:**

- Menu lateral fixo à esquerda com: Sair, Usuário (perfil próprio), Usuários, Tipos de Item, Itens.
- Botão "Novo Pedido".
- Lista de pedidos (padrão: todos os status), com filtros por status, data e nome de quem retirou o item.

### 4.2 Novo Pedido (modal)

**História de usuário**

> Como almoxarife, quero registrar um novo pedido de empréstimo informando quem vai receber os itens e os itens necessários, para controlar a saída de material. O acompanhamento do andamento (saída, devolução) é feito depois, por edição do pedido, através do status — inclusive quando o material não retorna integralmente (ex.: itens de consumo como tinta, fita, papel, ou EPI, junto com itens que retornam, como uma ferramenta).

**Campos do modal (criação):**
| Campo | Tipo | Observação |
|---|---|---|
| Nome | Texto/Referência | Quem vai receber o pedido |
| Descrição | Texto | Opcional |
| Itens do pedido | Lista | Mesma listagem padrão de itens, mas sem os inativos, com botão "Adicionar" (item + quantidade retirada) |
| Status | Enum | Campo desabilitado na criação, sempre pré-selecionado como "Pendente" |

**Fluxo de status e edição do pedido:**

1. **Pendente** (status inicial, ao criar): nome, descrição, itens e quantidades ainda podem ser editados livremente. A partir daqui o status só pode ir para **Em campo** ou **Cancelado**.
2. **Em campo**: ao mudar para esse status, o pedido inteiro **trava** (nome, descrição e itens não podem mais ser alterados) e o sistema registra a data de saída real. A única ação possível a partir daqui é mudar o status para **Voltou**.
3. **Voltou**: ação **única e definitiva** de fechamento do pedido (não existe devolução parcial em etapas — todo o acerto de quantidades é feito de uma vez, nessa transição).
4. **Cancelado**: só pode ser aplicado enquanto o pedido está em **Pendente** (antes de ir a campo). Depois de "Em campo" o pedido não pode mais ser cancelado, só fechado com "Voltou".

**Tela de edição do pedido:** permite mudar o status, o nome, a descrição, e adicionar/editar/remover itens da lista — respeitando as travas de cada status (detalhadas abaixo). A lista de itens mostra nome, tipo e quantidade emprestada, com um ícone de opções por linha; a única opção nele é **"Editar"**, que abre o modal de edição daquele item.

**Modal de edição de item (dentro do pedido), por status do pedido:**

| Status do pedido                   | Campos mostrados                                                                   | Editável                                   | Botões                         |
| ---------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------ |
| **Pendente**                       | Nome do item, Tipo (ambos travados — vêm do cadastro), Quantidade emprestada       | Quantidade emprestada                      | Cancelar, Salvar, **Remover**  |
| **Em campo**                       | —                                                                                  | Pedido travado, modal de item não é aberto | —                              |
| **Em campo → mudando para Voltou** | Nome, Tipo, Quantidade emprestada (travada), **Quantidade devolvida** (novo campo) | Quantidade devolvida                       | Cancelar, Salvar (sem Remover) |

> **Importante:** ao abrir o modal de edição do item nessa etapa (pedido indo para "Voltou"), o campo **"Quantidade devolvida" inicia como `null` (vazio na tela), nunca como `0` ou em branco por acaso**. Isso é o que permite diferenciar "usuário ainda não informou quanto voltou" de "usuário informou que voltou 0" (caso de item consumível/EPI que não retorna) — ver RN19 e RN20.

**Regras de negócio:**

- RN10: Ao mudar o status para **"Em campo"**, o sistema registra a data de saída real e trava o pedido inteiro (nome, descrição e itens) — RN18.
- RN11: Ao mudar o status para **"Voltou"**, o sistema registra a data de entrega real.
- RN12: Pedido nunca pode ser excluído, apenas editado (mudança de status, dados, itens etc., respeitando as travas de cada etapa).
- RN17: Os campos de data prevista de saída e data prevista de volta **foram removidos** do cadastro do pedido. A data exibida para o pedido (na listagem e nos filtros) passa a ser a data da **última atualização de status** do pedido.
- RN18: Nome, descrição e a lista de itens (adicionar/remover item, alterar quantidade retirada) só podem ser editados enquanto o pedido está **Pendente**. Ao entrar em **Em campo**, tudo isso fica travado — a única mudança possível é o status para "Voltou".
- RN19: Ao selecionar o status **"Voltou"**, a tabela de itens do pedido ganha a coluna **"Voltou"**, e o modal de cada item passa a exibir o campo obrigatório "quantidade devolvida" (a opção Remover deixa de existir). O campo **inicia como `null`** (não como `0`) — o valor final informado deve ser **maior ou igual a zero e menor ou igual à quantidade emprestada** daquele item (não pode devolver mais do que pegou). Itens que não retornam (consumíveis, EPI etc.) recebem quantidade devolvida "0", informado explicitamente pelo usuário.
- RN20: O pedido só pode ser **salvo** com o status "Voltou" quando a quantidade devolvida de **todos** os itens da lista tiver sido informada — validação tudo-ou-nada. A validação verifica **presença de valor** (`quantidadeDevolvida !== null`), e não se o valor é "verdadeiro"/diferente de zero — assim um item com devolução `0` conta como informado, mas um item cujo campo nunca foi tocado (ainda `null`) bloqueia o salvamento.
- RN21: Ao confirmar "Voltou", para cada item: `qtdEstoque += quantidade devolvida` e `qtdEmprestada -= quantidade retirada` (a diferença entre retirado e devolvido — ex.: pegou 10, devolveu 5 — é baixa permanente do estoque, cobrindo o caso de itens consumíveis/EPI que não retornam, sem precisar de um campo "retornável" no cadastro do item).
- RN22: Cancelar um pedido (status "Cancelado") só é permitido a partir do status **Pendente**. A partir de "Em campo" essa opção não fica mais disponível.

**Status do pedido de empréstimo:**

Em vez de criar uma tela para cadastrar status dinamicamente (o que geraria complexidade desnecessária — teria que garantir que sempre exista um status "inicial" e um "final", e as regras RN10/RN11/RN19/RN20/RN21 dependem de status com nomes específicos no código), a sugestão é usar uma **lista fixa de status já no sistema** (enum), com um pequeno texto de apoio para o usuário entender cada um:

| Status        | Quando ocorre                     | Efeito automático                                             | Transições possíveis | Cor           | Hex       |
| ------------- | --------------------------------- | ------------------------------------------------------------- | -------------------- | ------------- | --------- |
| **Pendente**  | Status inicial, ao criar o pedido | —                                                             | Em campo, Cancelado  | Amarelo/Âmbar | `#F59E0B` |
| **Em campo**  | Item(ns) efetivamente retirado(s) | Registra data de saída real; trava nome, descrição e itens    | Voltou               | Azul          | `#3B82F6` |
| **Voltou**    | Fechamento do pedido              | Registra data de entrega real; baixa/retorna estoque por item | — (final)            | Verde         | `#22C55E` |
| **Cancelado** | Pedido cancelado antes de sair    | —                                                             | — (final)            | Vermelho      | `#EF4444` |

Isso mantém a regra de negócio simples: o código sabe exatamente o que "Em campo" e "Voltou" significam. Se no futuro fizer sentido, dá pra permitir apenas a **descrição** de cada status ser editável (não o nome/comportamento), sem abrir uma tela de CRUD completa de status.

### 4.3 Listagem de Pedidos

**Colunas/filtros:** status (padrão: todos), data (referente à última atualização de status), nome de quem recebeu o pedido.
**Ação disponível:** clicar para editar o pedido (nunca excluir).

### 4.4 Página de Itens

**Listagem:** nome, quantidade disponível, quantidade emprestada — incluindo itens inativos.
**Ação:** edição do item disponível apenas para usuários com a permissão correspondente.

---

## 5. Resumo das Entidades

```
Usuário
 ├─ nome
 ├─ email
 ├─ senha
 ├─ perfil (enum: root | supervisor | almoxarifeChefe | almoxarifeAuxiliar)
 └─ ativo (bool)

TipoItem
 ├─ nome
 ├─ descrição
 └─ ativo (bool)

Item
 ├─ nome
 ├─ tipoItem (FK)
 ├─ qtdEstoque
 ├─ qtdEmprestada
 └─ ativo (bool)

Pedido (empréstimo)
 ├─ usuario (FK - quem recebe)
 ├─ descricao
 ├─ status (Pendente | Em campo | Voltou | Cancelado)
 ├─ dataUltimaAtualizacaoStatus
 ├─ dataSaidaReal
 ├─ dataVoltaReal
 └─ itens[]
     ├─ item (FK)
     ├─ quantidadeRetirada
     └─ quantidadeDevolvida (nullable; null até ser informada; 0 ≤ devolvida ≤ retirada quando preenchida)
```
