# Levantamento de Requisitos — Sistema de Almoxarifado

## 1. Visão Geral

Sistema web para gestão de almoxarifado, permitindo controle de usuários e permissões, cadastro de itens e tipos de itens, e o fluxo de empréstimo (saída/devolução) e compra de materiais.

**Perfis de acesso padrão (protegidos, não podem ser excluídos nem editados):**
- Root
- Supervisor
- Almoxarife Chefe
- Almoxarife Auxiliar

---

## 2. Módulo: Usuários e Permissões

### 2.1 Permissões

**História de usuário**
> Como administrador do sistema, quero cadastrar perfis de permissão personalizados, definindo quais ações do sistema cada perfil pode executar, para controlar o acesso de cada usuário.

**Ações:** Cadastrar, editar, excluir (perfis criados pelo usuário).

**Campos:**
| Campo | Tipo | Observação |
|---|---|---|
| Título | Texto | Nome do perfil |
| Ações permitidas | Lista de booleanos | Uma entrada true/false para cada ação existente no sistema |

**Regras de negócio:**
- RN01: Os 4 perfis padrão (root, supervisor, almoxarife chefe, almoxarife auxiliar) não podem ser excluídos.
- RN02: Os perfis padrão são travados por completo — nem título nem ações podem ser editados. O botão/ação de editar nem deve aparecer na listagem para esses 4 perfis.
- RN02b: Uma permissão criada pelo usuário só pode ser excluída se **não estiver em uso** por nenhum usuário no momento.

**Lista de ações do sistema (itens da lista true/false):**

| Grupo | Ação |
|---|---|
| Usuários | `usuario.criar`, `usuario.editar`, `usuario.inativar`, `usuario.deletar` |
| Permissões | `permissao.criar`, `permissao.editar`, `permissao.deletar` |
| Tipo de Item | `tipoItem.criar`, `tipoItem.editar`, `tipoItem.inativar`, `tipoItem.deletar` |
| Item | `item.criar`, `item.editar`, `item.inativar` |
| Pedido (empréstimo) | `pedido.criar`, `pedido.editar` |
| Pedido de Compra | `pedidoCompra.criar`, `pedidoCompra.editar`, `pedidoCompra.aprovar` |

*(Lista inicial — pode crescer conforme novas telas/ações forem definidas.)*

**Matriz de permissões de fábrica dos perfis padrão:**

| Ação | Root | Supervisor | Almoxarife Chefe | Almoxarife Auxiliar |
|---|:---:|:---:|:---:|:---:|
| `usuario.*` | ✅ | ✅ | ✅ | ❌ |
| `permissao.*` | ✅ | ❌ | ❌ | ❌ |
| `tipoItem.*` | ✅ | ✅ | ✅ | ❌ |
| `item.criar` / `item.editar` / `item.inativar` | ✅ | ✅ | ✅ | ✅ |
| `pedido.criar` / `pedido.editar` | ✅ | ✅ | ✅ | ✅ |
| `pedidoCompra.criar` / `pedidoCompra.editar` | ✅ | ✅ | ✅ | ❌ |
| `pedidoCompra.aprovar` | ✅ | ✅ | ❌ | ❌ |

### 2.2 Usuários

**História de usuário**
> Como administrador, quero cadastrar os usuários do sistema associando um cargo e um perfil de permissão, e poder inativá-los quando saem da empresa, sem perder o histórico de pedidos vinculados a eles.

**Ações:** Cadastrar, editar (inclui inativar), excluir.

**Campos:**
| Campo | Tipo | Observação |
|---|---|---|
| Nome | Texto | |
| Email | Texto | Login do sistema |
| Senha | Texto (hash) | |
| Permissão | Referência | Vínculo com o perfil de permissão |
| Cargo na empresa | Texto | |

**Regras de negócio:**
- RN03: Usuário inativo não deve conseguir logar no sistema.
- RN04: Usuário inativo continua aparecendo normalmente no histórico dos pedidos já feitos por ele (não é removido nem ocultado dos registros antigos).

---

## 3. Módulo: Armazém

### 3.1 Tipo de Item

**História de usuário**
> Como almoxarife, quero organizar os itens por tipo (ex.: eletrônico, tinta), com uma breve descrição, podendo inativar tipos que não uso mais sem perder o histórico dos itens já cadastrados nesse tipo.

**Ações:** Cadastrar, editar, inativar, excluir.

**Campos:**
| Campo | Tipo |
|---|---|
| Nome do tipo | Texto |
| Descrição | Texto |

**Regras de negócio:**
- RN05: Ao inativar um tipo, os itens vinculados a ele deixam de aparecer nas listagens.
- RN06: Só é possível excluir um tipo se não houver nenhum item vinculado a ele.

### 3.2 Item

**História de usuário**
> Como almoxarife, quero cadastrar os itens do estoque com nome, tipo e quantidades, para saber o que está disponível e o que está emprestado a qualquer momento.

**Ações:** Cadastrar, editar, inativar (sem opção de excluir).

**Campos:**
| Campo | Tipo | Observação |
|---|---|---|
| Nome do item | Texto | |
| Tipo do item | Referência | Vínculo com Tipo de Item |
| Quantidade em estoque | Número | Disponível para novo pedido |
| Quantidade emprestada | Número | Calculado a partir dos pedidos em aberto |

**Regras de negócio:**
- RN07: Item inativo não aparece na lista de itens disponível dentro do modal de novo pedido.
- RN08: Item inativo continua aparecendo na listagem geral de itens (a lista de itens mostra inativos).
- RN09: Item **nunca pode ser excluído**, apenas inativado — mesmo com unidades emprestadas em pedidos ativos. Um item inativo continua podendo ser devolvido normalmente (aparece nos pedidos já existentes), só não pode ser escolhido em pedidos novos. A quantidade emprestada continua sendo controlada normalmente até zerar.

---

## 4. Módulo: Pedidos (Empréstimo)

### 4.1 Home

**História de usuário**
> Como usuário do sistema, ao entrar na home eu quero ver de imediato a lista de pedidos e ter acesso rápido para criar um novo pedido e navegar para as demais áreas do sistema.

**Elementos da Home:**
- Menu lateral fixo à esquerda com: Sair, Usuário (perfil próprio), Usuários, Permissões, Tipos de Item, Itens, Pedidos de Compra.
- Botão "Novo Pedido".
- Lista de pedidos (padrão: todos os status), com filtros por status, data e nome de quem retirou o item.

### 4.2 Novo Pedido (modal)

**História de usuário**
> Como almoxarife, quero registrar um novo pedido de empréstimo informando quem vai retirar os itens, o período previsto e os itens necessários, para controlar a saída de material.

**Campos do modal:**
| Campo | Tipo | Observação |
|---|---|---|
| Nome do usuário | Texto/Referência | Quem está retirando |
| Data prevista de saída | Data | |
| Data prevista de volta | Data | |
| Descrição | Texto | Opcional |
| Itens do pedido | Lista | Mesma listagem padrão de itens, mas sem os inativos, com botão "Adicionar" |

**Regras de negócio:**
- RN10: Ao mudar o status para **"Em campo"**, o sistema registra a data de saída real.
- RN11: Ao mudar o status para **"Voltou"**, o sistema registra a data de entrega real.
- RN12: Pedido nunca pode ser excluído, apenas editado (mudança de status, dados, itens etc.).

**Sugestão de status do pedido de empréstimo:**

Em vez de criar uma tela para cadastrar status dinamicamente (o que geraria complexidade desnecessária — teria que garantir que sempre exista um status "inicial" e um "final", e as regras RN10/RN11 dependem de status com nomes específicos no código), a sugestão é usar uma **lista fixa de status já no sistema** (enum), com um pequeno texto de apoio para o usuário entender cada um:

| Status | Quando ocorre | Efeito automático |
|---|---|---|
| **Pendente** | Status inicial, ao criar o pedido | — |
| **Em campo** | Item(ns) efetivamente retirado(s) | Registra data de saída real |
| **Atrasado** | Passou da data prevista de volta e ainda está "Em campo" | Pode ser calculado automaticamente (não precisa ser escolhido manualmente) comparando a data atual com a data prevista de volta |
| **Voltou** | Item(ns) devolvido(s) | Registra data de entrega real |
| **Cancelado** | Pedido cancelado antes de sair | — |

Isso mantém a regra de negócio simples (o código sabe exatamente o que "Em campo" e "Voltou" significam) e ainda cobre o caso de atraso, que você provavelmente vai querer visualizar na lista de pedidos mais cedo ou mais tarde. Se no futuro fizer sentido, dá pra permitir apenas a **descrição** de cada status ser editável (não o nome/comportamento), sem abrir uma tela de CRUD completa de status.

### 4.3 Listagem de Pedidos

**Colunas/filtros:** status (padrão: todos), data, nome de quem pegou.
**Ação disponível:** clicar para editar o pedido (nunca excluir).

### 4.4 Página de Itens

**Listagem:** nome, quantidade disponível, quantidade emprestada — incluindo itens inativos.
**Ação:** edição do item disponível apenas para usuários com a permissão correspondente.

---

## 5. Módulo: Pedidos de Compra

**História de usuário**
> Como usuário do sistema, quero solicitar a compra de um material descrevendo livremente o que preciso, para que o supervisor avalie e aprove a compra.

**Acesso:** botão próprio no menu lateral, levando à lista de pedidos de compra.

**Ações:** Cadastrar e editar (Supervisor e Almoxarife Chefe), aprovar/reprovar (somente Supervisor).

**Campos:**
| Campo | Tipo | Observação |
|---|---|---|
| Solicitante | Referência | Usuário do sistema logado — preenchido automaticamente (nome + email) |
| Pedido | Texto livre | Descrição livre do que está sendo solicitado (mais flexível que uma lista estruturada de itens) |
| Status | Enum | **Novo → Em análise → Aprovado / Reprovado** |

**Regras de negócio:**
- RN13: Somente **Supervisor** pode aprovar ou reprovar um pedido de compra. Tanto **Supervisor** quanto **Almoxarife Chefe** podem criar um pedido de compra.
- RN14: Pedido de compra é criado sempre com status **"Novo"**.
- RN15: O solicitante pode editar o pedido livremente enquanto o status estiver **"Novo"**. Assim que o status muda para **"Em análise"**, o pedido fica travado para edição (só o Supervisor pode então mudar o status para Aprovado/Reprovado).
- RN16: Pedido de compra **Reprovado** fica apenas como histórico — não pode ser reaberto nem duplicado automaticamente pelo solicitante (se ele quiser pedir de novo, cria um pedido novo do zero).

---

## 6. Resumo das Entidades

```
Permissão
 ├─ título
 └─ ações[] (bool)

Usuário
 ├─ nome
 ├─ email
 ├─ senha
 ├─ permissão (FK)
 ├─ cargo
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
 ├─ usuario (FK - quem retira)
 ├─ dataPrevistaSaida
 ├─ dataPrevistaVolta
 ├─ dataSaidaReal
 ├─ dataVoltaReal
 ├─ descricao
 ├─ status (Pendente | Em campo | Atrasado | Voltou | Cancelado)
 └─ itens[] (FK Item + quantidade)

PedidoCompra
 ├─ solicitante (FK Usuário)
 ├─ pedido (texto livre)
 └─ status (Novo | Em análise | Aprovado | Reprovado)
```
