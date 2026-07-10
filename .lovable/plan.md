## Diagnóstico

Investigando o código e o banco, encontrei dois problemas graves no fluxo de "Alterações Agendadas":

1. **A função `apply_scheduled_change` do banco não aplica a mudança de fato.** Ela apenas marca o registro como `applied`, sem tocar em `bus_schedules`. O mesmo vale para `apply_due_scheduled_changes`. Ou seja, hoje o agendamento nunca substitui os horários reais — a menos que exista (ou tenha existido) alguma versão que aplicava direto. Isso explica por que o comportamento ficou imprevisível.
2. **Não há proteção de data.** `apply_scheduled_change` aceita aplicar mesmo antes da data de vigência, e `apply_due_scheduled_changes` compara com `current_date` (UTC) — em Brasília (UTC-3), das 21h em diante a "data de hoje" no banco já é a de amanhã, então um agendamento marcado para amanhã pode ser tratado como vencido no mesmo dia.
3. **Não existe rotina automática** rodando a aplicação diária, então nada garante que a substituição aconteça exatamente na data prevista.

## O que vou mudar

### 1. Corrigir a função `apply_scheduled_change` (banco)
Ela passará a:
- Ler o registro pendente.
- Comparar a `effective_date` com a data atual **em `America/Sao_Paulo`**: `(now() AT TIME ZONE 'America/Sao_Paulo')::date`.
- Se ainda não chegou a data, retornar `false` e **não** mexer em `bus_schedules`. É o guard-rail que impede a mudança instantânea que você viu.
- Se chegou, executar `replace_all`: deletar todos os `bus_schedules` daquela `bus_line_id` + `day_type` + `direction` e inserir os itens do `payload->'items'` (campos `hora`, `obs`).
- Marcar o registro como `applied` + `applied_at = now()`.
- Em caso de erro, marcar `status='failed'` e gravar mensagem em `error`.

### 2. Corrigir `apply_due_scheduled_changes` (banco)
- Selecionar todos os `pending` com `effective_date <= (now() AT TIME ZONE 'America/Sao_Paulo')::date`.
- Reaproveitar a lógica de `apply_scheduled_change` para cada um.
- Retornar quantos foram aplicados.

### 3. Job diário automático (pg_cron)
- Habilitar `pg_cron` (se ainda não estiver) e criar job `apply-scheduled-changes-daily` rodando **todo dia às 03:05 UTC** (= 00:05 em Brasília) que chama `apply_due_scheduled_changes()`.
- Assim o público vê a mudança já na manhã da data prevista, sem depender de ninguém abrir o painel.

### 4. Ajustes de UI no card "Alterações Agendadas"
- **Botão "Aplicar agora"**: adicionar `AlertDialog` de confirmação explicando "isso ignora a data de vigência e aplica imediatamente".
- **Botão "Aplicar vencidas"**: manter, mas fica claro que só age em agendamentos cuja data já passou (em Brasília).
- **Mensagem de erro melhor**: quando a RPC retornar `false` por causa da data futura, o toast dirá "Aguardando a data de vigência (Brasília)" em vez do genérico atual.
- **Nenhuma chamada automática** a `applyNow`/`applyAllDue` fora do clique do usuário (já é o caso, mantido).

### 5. Validação
- Após aplicar, rodar um teste manual: criar um agendamento para amanhã, conferir que `bus_schedules` **não** muda, chamar `apply_scheduled_change` e confirmar que retorna `false` e nada mudou. Depois criar um com data de hoje, aplicar e confirmar substituição correta.

## Detalhes técnicos

- Timezone: sempre `(now() AT TIME ZONE 'America/Sao_Paulo')::date` para comparar com `effective_date` (que é `date`, sem TZ).
- `SECURITY DEFINER` mantido nas funções e `search_path = public` já configurado.
- Sem alteração de schema, apenas `CREATE OR REPLACE FUNCTION` das duas funções + `SELECT cron.schedule(...)` para o job (via ferramenta de insert, não migration, porque contém URL/anon do projeto? — não, aqui é SQL puro chamando função interna, então pode ir na migration).
- Sem mudanças no cliente Supabase gerado. Só editar `useScheduledChanges.ts` (mensagem do toast) e `ScheduledChangesCard.tsx` (confirmação do "Aplicar agora").

## Fora do escopo

- Não vou mexer no CRUD imediato de `bus_schedules` (edição direta pelo painel continua igual — muda na hora, como sempre foi).
- Não vou alterar a estrutura da tabela `scheduled_schedule_changes` (colunas legadas permanecem).
