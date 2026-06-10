## Plano: sincronizar o projeto com o ZIP enviado

Objetivo: deixar o código do projeto idêntico ao `trectur-main.zip` anexado, preservando configurações geradas automaticamente e o histórico de migrações já aplicado no banco.

### O que será sobrescrito/criado a partir do ZIP

Todos os arquivos comuns serão substituídos pela versão do ZIP, incluindo (entre outros):

- `src/components/BusSchedule/LineMap.tsx` e demais componentes
- `src/pages/*`, `src/hooks/*`, `src/data/*`, `src/index.css`, `src/App.tsx`
- `tailwind.config.ts`, `vite.config.ts`, `index.html`, `package.json`
- `supabase/functions/sonda-vehicle-position/index.ts`

Arquivos novos que serão adicionados:

- `src/components/Admin/ScheduledChangesCard.tsx`
- `src/components/Admin/SondaCredentialsCard.tsx`
- `src/components/Admin/SpecialDatesCard.tsx`
- `src/hooks/useLineRoute.ts`
- `src/hooks/useVehiclePosition.ts`
- `supabase/functions/sonda-line-route/index.ts`

Observação sobre maiúsculas/minúsculas: o ZIP usa a pasta `src/components/Admin/` (com A maiúsculo) e o projeto atual usa `src/components/admin/` (com a minúsculo). Vou remover a pasta minúscula e criar a maiúscula, para bater exatamente com os imports do ZIP em `src/pages/Admin.tsx`.

### O que será removido (existe hoje, não existe no ZIP)

- `supabase/functions/sonda-credentials/` (função não presente no ZIP)
- `src/components/admin/` (substituído por `Admin/`)
- `public/.htaccess`
- `.github/workflows/deploy.yml`

### O que NÃO será tocado (preservado intencionalmente)

- `.env`, `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `supabase/config.toml` — arquivos auto-gerados pela plataforma.
- `supabase/migrations/*` existentes (histórico já aplicado no banco). As migrações que estão apenas no ZIP (datadas de abril/maio) já são anteriores ao histórico atual e não serão re-aplicadas; mantemos só as do banco atual para evitar conflitos.
- `.git`, `supabase/.temp/` e demais metadados internos.

### Validação após aplicar

- Conferir o build sem erros TypeScript.
- Abrir a preview e validar a tela do mapa (tela cheia, centralização e marcadores) que foi o foco das últimas correções.

Se confirmar, prossigo trocando para modo de execução para sincronizar os arquivos.