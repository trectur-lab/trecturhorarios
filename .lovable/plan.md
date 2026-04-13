

## Plano: Corrigir travamento na edição de horários

### Problema identificado

No `Admin.tsx`, o diálogo de edição de horários (criar/editar) usa um único componente `Dialog` controlado por `isScheduleDialogOpen`. Após salvar uma edição (`handleUpdateSchedule`), o estado é resetado e `fetchSchedules` é chamado, causando re-render. O problema é que o `Dialog` do Radix UI pode ter conflito entre o estado controlado (`open`/`onOpenChange`) e o `DialogTrigger` interno, impedindo a reabertura do diálogo ao clicar no botão de edição de outro horário.

### Correção

1. **Separar o diálogo de edição do DialogTrigger de criação** — Mover o `DialogContent` do diálogo de horários para fora do bloco `Dialog`+`DialogTrigger` do botão "Novo Horário". Usar um `Dialog` controlado independente (sem `DialogTrigger`) para edição, e manter o `DialogTrigger` apenas para criação.

2. **Garantir reset completo do estado** — Após fechar o diálogo, garantir que `editingSchedule` e `scheduleForm` sejam limpos corretamente antes de permitir nova abertura.

3. **Forçar remontagem do diálogo** — Adicionar uma `key` no `Dialog` baseada no `editingSchedule?.id` para forçar remontagem do componente quando um novo horário é selecionado para edição.

### Arquivo alterado

- `src/pages/Admin.tsx` — Reestruturar o Dialog de horários para separar criação e edição, usando um Dialog controlado sem DialogTrigger para edição, e adicionando key para forçar remontagem.

