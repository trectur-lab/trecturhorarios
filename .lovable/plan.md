# Correção da integração SONDA Mobility

O PDF mostra que a API real é diferente do que assumimos. Vou ajustar tudo para bater com a especificação correta.

## O que muda na API (vs. implementação atual)

| Item | Atual (errado) | Real (PDF) |
|---|---|---|
| Auth | POST `{base}/login` com headers `X-Username`/`X-Password` | POST `https://consultaviagem.m2mfrota.com.br/AutenticarUsuario` com **body** `{usuario, senha}` |
| Posição | POST `{base}/posicao` com body `{numeroLinha}` | **GET** `https://zn5.sinopticoplus.com/servico-dados/api/v1/obterPosicaoVeiculo` com header `Authorization: <token>` |
| Rota (polyline) | POST `{base}/rota` | **Não existe** na API |
| Resposta | `lat/lng`, `dataHora` ISO | `latitude/longitude`, `linha`, `dataHora` em **epoch ms**, `sentido` ("ida"/"volta"), `trajeto`, `velocidade` |

A API retorna **todos os veículos da frota**; é preciso filtrar por `linha === numero da linha`.

## Mudanças

### 1. Banco — `sonda_credentials`
Migração para substituir os campos de URL:
- Remover: `base_url`, `login_path`, `vehicle_position_path`, `line_route_path`
- Adicionar: `auth_url` TEXT, `position_url` TEXT, `dashboard_url` TEXT (opcional, para uso futuro)

Pré-preencher via UPDATE com os valores fornecidos.

### 2. Edge function `sonda-vehicle-position`
Reescrever:
1. Buscar credenciais.
2. **POST** em `auth_url` com `{"usuario": ..., "senha": ...}` → extrair token (campo `token` ou string raw — tratar ambos).
3. Cachear token em memória do worker por ~50 min (token JWT) para evitar auth a cada chamada.
4. **GET** em `position_url` com header `Authorization: <token>`.
5. Mapear cada veículo:
   - `lat = latitude`, `lng = longitude`
   - `dataHora = new Date(dataHora_ms).toISOString()`
   - `linha`, `sentido`, `trajeto`, `velocidade`, `placa`, `codigo`
6. Filtrar `linha === numeroLinha` (case-insensitive, sem leading zero mismatch).
7. Manter filtros existentes: idade máx. 10 min, fora da garagem, status moving/idle/stopped.
8. Se token expirou (401), limpar cache e tentar uma vez novamente.

### 3. Edge function `sonda-line-route`
A API não fornece traçado. Opções:
- **Escolhida**: remover a função e a feature de polyline. O mapa mostra só os marcadores dos veículos + posição da garagem.
- Remover `useLineRoute.ts` e qualquer referência em `LineMap.tsx`.

### 4. Edge function `sonda-credentials` + hook admin
Atualizar para os novos campos (`auth_url`, `position_url`, `dashboard_url`).

### 5. UI `SondaCredentialsCard`
Trocar os três campos de path por três campos de URL completa:
- URL Autenticação
- URL Posição Veículo
- URL Dashboard (opcional)

Defaults pré-preenchidos com as URLs do PDF.

### 6. Filtro por linha
Como `linha` na resposta bate com `bus_lines.numero` (ex.: "07"), o campo `sonda_id_linha` deixa de ser necessário para posicionamento. Mantenho a coluna existente (sem alterar schema) como override opcional: se preenchido, usa ele; senão, usa `numero`.

## Arquivos afetados

- **Migração nova**: alterar colunas de `sonda_credentials` + UPDATE com URLs fornecidas
- `supabase/functions/sonda-vehicle-position/index.ts` — reescrita completa
- `supabase/functions/sonda-credentials/index.ts` — novos campos
- `supabase/functions/sonda-line-route/index.ts` — **deletar**
- `src/hooks/useSondaCredentialsAdmin.ts` — novos campos
- `src/hooks/useLineRoute.ts` — **deletar**
- `src/components/admin/SondaCredentialsCard.tsx` — novos inputs
- `src/components/BusSchedule/LineMap.tsx` — remover uso do `useLineRoute` / polyline

## Observação de segurança
A senha continua em texto na tabela (acessada só por service_role / edge functions, sem RLS público de SELECT). Sem mudança nesse ponto.

Posso aplicar?
