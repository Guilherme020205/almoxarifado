---
paths:
  - "projects/**"
---

# Documentação e Regras de Negócio

## 1. Consulta obrigatória à documentação

- Antes de implementar novas funcionalidades, corrigir bugs ou alterar comportamentos que envolvam regras de negócio, consulte a documentação correspondente.
- A documentação de requisitos é a principal fonte de verdade para as regras de negócio do sistema.
- Não presuma, invente ou deduza regras de negócio sem fundamento na documentação ou em uma definição explícita do desenvolvedor.
- Analise também as regras de permissões, restrições e relacionamentos envolvidos na funcionalidade.

## 2. Conflitos entre solicitação e documentação

- Se uma solicitação do desenvolvedor contrariar uma regra de negócio documentada, interrompa a implementação e apresente o conflito.
- Explique qual regra está documentada, o que foi solicitado e qual seria o impacto da alteração.
- Aguarde a confirmação do desenvolvedor antes de prosseguir.
- Não escolha automaticamente entre a documentação e a solicitação.

## 3. Regras novas ou não documentadas

- Se o desenvolvedor solicitar um comportamento que não esteja especificado na documentação, verifique se existe alguma regra relacionada que possa ser afetada.
- Caso não exista uma definição clara, alerte o desenvolvedor antes de implementar.
- Apresente a lacuna identificada e explique quais decisões precisam ser definidas.
- Não transforme suposições em regras de negócio.
- Aguarde a definição do desenvolvedor quando a decisão puder afetar o comportamento do sistema.

## 4. Atualização da documentação

- Quando uma nova regra de negócio for aprovada, verifique se a documentação precisa ser atualizada.
- Quando uma regra existente for modificada, mantenha a documentação sincronizada com a implementação.
- Não altere regras documentadas sem autorização explícita.
- Informe quais documentos precisam ser atualizados e realize a atualização quando estiver dentro do escopo autorizado.

## 5. Comunicação e validação

Antes de implementar alterações que envolvam conflitos ou lacunas nas regras de negócio, apresente claramente:

1. O que está definido atualmente na documentação.
2. O que foi solicitado pelo desenvolvedor.
3. Qual é a divergência ou informação ausente.
4. Qual decisão precisa ser tomada.

Não prossiga com decisões de negócio pendentes sem confirmação.
