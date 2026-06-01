## Plano: Replicação completa do TrecTur conforme prompt anexo

O projeto atual já tem: `bus_lines`, `bus_schedules`, `user_roles`, função `has_role`, `setup_first_admin`, rotas (`/`, `/instalar`, `/admin`, `/admin/login`, `/admin/setup`, `/admin/import`) e CRUD admin básico. O plano abaixo cobre tudo que falta para chegar à paridade descrita no arquivo.

---

### 1. Migrations de banco

**1.1 Estender `bus_lines`**
- Adicionar colunas `sonda_codigo_veiculo TEXT`, `sonda_id_linha TEXT`.

**1.2 Criar `sonda_credentials`**
- Colunas: `username`, `password`, `updated_at`.
- RLS habilitada, sem policies públicas (apenas service_role via edge functions).
- GRANT só para `service_role`.

**1.3 Criar `scheduled_schedule_changes`**
- Colunas: `bus_line_id` (FK), `change_type` (`edit`/`replace_all`), `day_type`, `direction`, `target_hora`, `new_hora`, `new_obs`, `scheduled_for`, `applied_at`.
- Leitura pública, modificação só admin.

**1.4 Criar `special_dates`**
- Colunas: `date UNIQUE`, `description`, `default_override` (`uteis`/`sabados`/`domingos`/`no_service`).
- Leitura pública, modificação só admin.

**1.5 Criar `special_date_line_overrides`**
- FKs para `special_dates` e `bus_lines`; coluna `override`; UNIQUE(special_date_id, bus_line_id).
- Leitura pública, modificação só admin.

Todas as tabelas seguem o padrão obrigatório: CREATE TABLE → GRANT → ENABLE RLS → CREATE POLICY. CHECK constraints substituídas por triggers de validação quando envolverem expressões não-imutáveis.

---

### 2. Edge Functions (Supabase)

**2.1 `sonda-vehicle-position`** (`verify_jwt = false`)
- Recebe `{ numeroLinha }`.
- Carrega credenciais de `sonda_credentials` via service-role.
- Autentica e consulta API SONDA Mobility.
- Filtra: ≤10 min de idade, fora do raio de 75 m da garagem (`-21.709497, -45.264057`).
- Retorna array `{ codigo, placa, lat, lng, velocidade, dataHora, sentido, trajeto, bearing, status }`.
- CORS completo + validação Zod do body.

**2.2 `sonda-line-route`** (`verify_jwt = false`)
- Recebe `{ numeroLinha }`.
- Busca shape/polyline da linha na API SONDA.
- Retorna `{ shape: [[lat,lng], ...] }`.
- Mesma autenticação compartilhada.

Credenciais SONDA serão inseridas pelo usuário via novo card admin (próximo passo); o segredo da API é lido da tabela, não de env var.

---

### 3. Hooks de dados (novos)

- `useLineVehicles(numeroLinha, mapSentido?)` — chama `sonda-vehicle-position`, polling 15s, cálculo de `status` (moving/idle/stopped) e `stoppedForSec`, filtro por sentido.
- `useLineRoute(numeroLinha)` — chama `sonda-line-route` com cache em memória por linha.
- `useScheduledChanges()` — CRUD de `scheduled_schedule_changes`.
- `useSpecialDates()` — CRUD de `special_dates` + `special_date_line_overrides`.
- `useSondaCredentialsAdmin()` — get/upsert via edge function dedicada (não expor service role no client).

Ajustar `useBusSchedulesPublic` (já existe) para aplicar overrides de `special_dates` na resolução do `day_type` por data e respeitar `no_service` por linha. Garantir paginação `.range()` em loop (limite 1000).

---

### 4. Componentes de UI

**Tela pública (`/`)**
- Novo componente `LineMap.tsx` usando `react-leaflet`:
  - Polyline da rota (`useLineRoute`).
  - Marcadores de veículos com seta rotacionada por `bearing` (movimento) ou bolinha (parado).
  - Legenda de status (verde/azul/vermelho conforme regra).
  - Botão flutuante fullscreen (`Maximize2`/`Minimize2`), `Esc` fecha, card expande para `fixed inset-0 z-[9999]`.
  - Info de última atualização + botão refresh.
- Integrar `LineMap` ao `BusSchedule/index.tsx` abaixo da grade de horários.
- Garantir terminologia "Ponto Inicial / Partida" e modal vermelho ao clicar em horário com `obs`.

**Painel admin (`/admin`)**
- `SondaCredentialsCard` — formulário de usuário/senha SONDA (chama edge function get/save).
- `ScheduledChangesCard` — listagem + criação de mudanças agendadas (`edit` ou `replace_all`).
- `SpecialDatesCard` — gestão de datas especiais e overrides por linha.
- Adicionar campos `sonda_codigo_veiculo` e `sonda_id_linha` ao formulário de edição de linha.

---

### 5. PWA (manifest-only, sem service worker)

Conforme orientação Lovable, **não** será usado `vite-plugin-pwa` (causa problemas no preview). Em vez disso:
- Garantir `public/manifest.json` com nome "TrecTur", short_name, descrição, `theme_color: #0F172A`, `background_color: #0F172A`, `display: standalone`, ícones 64/192/512 (gerar logo circular fundo branco via imagegen).
- Referenciar manifest no `index.html` + meta theme-color.
- Página `/instalar` já existe; revisar conteúdo com instruções Android/iOS.

(Caso o usuário queira posteriormente service worker offline, fazemos em uma segunda fase.)

---

### 6. Segurança

- Manter RLS em todas as tabelas novas, GRANTs explícitos, policies admin via `has_role`.
- Edge functions: validação Zod do body, CORS, service-role apenas para leitura de credenciais.
- `useAuth` continua expondo só `isAuthenticated`, `isAdmin`, `userEmail`.
- Nenhum signup anônimo; login email/senha (já implementado).

---

### 7. Detalhes técnicos / pacotes

Adicionar dependências:
```
leaflet ^1.9.4
react-leaflet ^4.2.1
@types/leaflet
zod (se ainda não estiver)
```

---

### 8. Sequência de execução

1. Migration única com tabelas 1.1–1.5 e triggers de validação.
2. Após aprovação: criar edge functions (`sonda-vehicle-position`, `sonda-line-route`, `sonda-credentials` para admin).
3. Criar hooks e cards admin novos.
4. Adicionar `LineMap` e integrar à tela pública; aplicar overrides de datas especiais em `useBusSchedulesPublic`.
5. Configurar manifest PWA e revisar `/instalar`.
6. Pedir ao usuário as credenciais SONDA pelo card admin e validar chamadas com `curl_edge_functions`.

### Arquivos afetados (resumo)
- `supabase/migrations/<nova>.sql`
- `supabase/functions/sonda-vehicle-position/index.ts`
- `supabase/functions/sonda-line-route/index.ts`
- `supabase/functions/sonda-credentials/index.ts`
- `src/hooks/useLineVehicles.ts`, `useLineRoute.ts`, `useScheduledChanges.ts`, `useSpecialDates.ts`, `useSondaCredentialsAdmin.ts`
- `src/hooks/useBusSchedulesPublic.ts` (overrides)
- `src/components/BusSchedule/LineMap.tsx`, `index.tsx`
- `src/components/admin/SondaCredentialsCard.tsx`, `ScheduledChangesCard.tsx`, `SpecialDatesCard.tsx`
- `src/pages/Admin.tsx` (incluir novos cards e campos sonda)
- `src/pages/Install.tsx` (revisão)
- `public/manifest.json`, `index.html`, ícones gerados em `public/`
- `package.json` (leaflet/react-leaflet)
