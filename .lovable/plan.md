## Resultado da análise dos dois projetos

Comparei arquivo por arquivo (hash MD5) o conteúdo do ZIP `trectur-main` com o projeto atual desta plataforma. **A grande maioria do código já é idêntica** — todos os 88 arquivos em `src/` batem byte a byte, incluindo:

- Mapa de linha (`LineMap.tsx`, `useLineRoute.ts`)
- Agenda de troca de horários (`ScheduledChangesCard.tsx`, `useScheduledChanges.ts`)
- Datas especiais (`SpecialDatesCard.tsx`, `useSpecialDates.ts`)
- Painel admin, autenticação, PWA, etc.

Ou seja, o app aqui já tem todas as funcionalidades do ZIP. As diferenças reais são pontuais:

| Arquivo | Situação |
|---|---|
| `supabase/functions/sonda-vehicle-position/index.ts` | **Diverge** (única diferença real de código) |
| `.env`, `src/integrations/supabase/types.ts`, `supabase/config.toml` | Auto-gerados pela plataforma, não devem ser sobrescritos |
| 7 migrations de junho/2026 | Existem só aqui; foram criadas para suportar exatamente o código do ZIP (coluna `sonda_codigo_veiculo`, `day_type` em overrides, NOT NULL relaxado etc.) — **devem ser mantidas** |

## O que vou fazer

### 1. Restaurar `supabase/functions/sonda-vehicle-position/index.ts` para a versão do ZIP

A diferença está em 1 trecho. A versão do ZIP usa as colunas `usuario / senha / data_url / is_active` em `sonda_credentials`, que **já existem no banco** (verifiquei em `types.ts`). Portanto a versão do ZIP funcionará sem necessidade de nova migration.

```text
sonda_credentials (colunas atuais no banco):
  auth_url, data_url, usuario, senha, is_active   ← usadas pelo ZIP ✓
  position_url, username, password                ← legado, mantido por compatibilidade
```

### 2. Redeployar a edge function

Após substituir o arquivo, faço `deploy` da `sonda-vehicle-position` para o ambiente aplicar a versão do ZIP.

### 3. Não tocar em mais nada

- **Não** alterar `src/integrations/supabase/types.ts` (auto-gerado).
- **Não** alterar `.env` nem `supabase/config.toml` (gerenciados pela plataforma).
- **Não** apagar migrations de junho — elas são exatamente o que dá suporte ao código do ZIP (campos SONDA, `day_type` em overrides, ajustes de RLS/GRANT).
- **Não** mexer em código de mapa, agenda ou datas especiais — já está idêntico ao ZIP.

## Por que não preciso “despejar” todo o ZIP por cima

Despejar o ZIP inteiro por cima do projeto **não mudaria nada visível** (os outros 87 arquivos `src/` têm hash idêntico) e ainda removeria as migrations de junho, o que quebraria o banco (faltariam colunas que o código do ZIP usa). A operação correta é o ajuste cirúrgico acima.

## Checagem final

Depois de aplicar:
- Verificar que a edge function `sonda-vehicle-position` responde ao `ping` sem 500.
- Confirmar no preview que mapa, painel de horários agendados e datas especiais continuam funcionando.
