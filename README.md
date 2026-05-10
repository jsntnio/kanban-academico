# Kanban Acadêmico - Sistema de Gerenciamento de Tarefas

Sistema web simples para professores e alunos gerenciarem tarefas utilizando metodologia Kanban. Desenvolvido com HTML, CSS e JavaScript puro (Vanilla), com persistência dos dados no `localStorage`.

## Funcionalidades

- Autenticação de usuários (professor e aluno)
- Professor:
  - Criar, editar, excluir tarefas
  - Atribuir tarefas a alunos específicos
  - Acompanhar progresso (tabela com status de cada aluno por tarefa)
  - Cadastrar novos alunos
  - Visualizar quadro Kanban com filtros
- Aluno:
  - Visualizar suas tarefas no quadro Kanban
  - Mover tarefas entre colunas (A Fazer, Em Andamento, Concluído)
  - Comentar em tarefas
  - Receber notificações de prazo (toasts)
- Quadro Kanban com drag & drop
- Filtros por status, prazo e aluno (professor)
- Notificações de prazos (atraso, hoje, amanhã, 2 dias)
- Interface responsiva (funciona em desktop, tablet e mobile)

## Como usar

1. Baixe todos os arquivos mantendo a estrutura de pastas: