---
paths:
  - "projects/**"
---

# Qualidade de Código e Testes

## 1. Criação e manutenção de testes

- Toda nova implementação deve possuir testes automatizados quando aplicável.
- Toda correção de bug deve incluir ou atualizar casos de teste que reproduzam o problema corrigido, quando aplicável.
- Quando uma alteração modificar um comportamento existente, atualize os testes correspondentes.
- Não remova ou altere testes apenas para fazer a implementação passar.
- Os testes devem validar o comportamento esperado e também considerar cenários de erro e casos extremos relevantes.

## 2. Execução dos testes

- Após realizar alterações, execute os testes relacionados aos arquivos e funcionalidades modificados.
- Execute também os testes novos ou atualizados durante a tarefa.
- Não é necessário executar toda a suíte de testes do projeto a cada alteração.
- Execute todos os testes do projeto somente quando solicitado explicitamente pelo usuário.
- Se identificar que uma alteração pode afetar outras funcionalidades, informe essa possibilidade, mas não execute toda a suíte automaticamente.

## 3. Relatório de validação

Ao finalizar uma tarefa, informe:

- Quais testes foram criados ou atualizados.
- Quais testes foram executados.
- Quais foram aprovados ou apresentaram falhas.
- Quais testes não foram executados.
- Se a alteração ainda apresenta algum risco ou necessidade de validação adicional.

## 4. Integridade dos testes

- Não considere uma implementação concluída apenas porque o código compila.
- Não ignore falhas de testes.
- Não altere a implementação dos testes para mascarar erros de código.
- Caso não existam testes automatizados na área modificada, avalie a necessidade de criá-los e informe quando não for viável.
