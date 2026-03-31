
# Plano: Correção de Vulnerabilidades de Segurança

## Resumo dos Problemas Identificados

O sistema de segurança identificou 5 vulnerabilidades que estão impedindo a publicação do projeto:

| Nível | Problema | Tabela/Arquivo |
|-------|----------|----------------|
| ERROR | Edge Function sem autenticação | `sync-bus-schedules` |
| WARN | Erros internos expostos | `sync-bus-schedules` |
| WARN | Tabelas sem proteção de escrita | `bus_schedules_cache`, `sync_metadata` |
| WARN | Race condition no setup | `setup_first_admin` |
| WARN | Leaked Password Protection | Configuração do Auth |

---

## Correções Detalhadas

### 1. Edge Function - Adicionar Autenticação

Adicionar verificação de autenticação e role de admin na função `sync-bus-schedules`:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Fluxo Atual (Inseguro)                   │
├─────────────────────────────────────────────────────────────┤
│   Qualquer pessoa ──► Chama função ──► Executa scraping    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Fluxo Corrigido                          │
├─────────────────────────────────────────────────────────────┤
│   Request ──► Valida JWT ──► Verifica Admin ──► Executa    │
│      │            │               │                         │
│      ▼            ▼               ▼                         │
│   401 Error   401 Error      403 Error                     │
└─────────────────────────────────────────────────────────────┘
```

**Alterações:**
- Validar header `Authorization` com JWT
- Verificar se usuário tem role `admin` na tabela `user_roles`
- Retornar 401/403 para acessos não autorizados

### 2. Edge Function - Ocultar Erros Internos

Substituir mensagens de erro detalhadas por mensagens genéricas:

| Antes (Inseguro) | Depois (Seguro) |
|------------------|-----------------|
| `"Firecrawl connector not configured"` | `"Serviço temporariamente indisponível"` |
| `String(error)` (stack trace completo) | `"Falha ao sincronizar. Tente novamente."` |

Os erros completos continuarão sendo logados no servidor via `console.error()`.

### 3. Políticas RLS para Tabelas de Cache

Adicionar políticas explícitas para `bus_schedules_cache` e `sync_metadata`:

```sql
-- Impedir escrita por usuários autenticados
-- (apenas service role pode escrever)
CREATE POLICY "Service role only write"
ON public.bus_schedules_cache
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);
```

Mesma política para `sync_metadata`.

### 4. Corrigir Race Condition no setup_first_admin

Adicionar lock de tabela para prevenir criação simultânea de múltiplos admins:

```sql
ALTER FUNCTION public.setup_first_admin(_user_id uuid)
-- Adicionar: LOCK TABLE public.user_roles IN EXCLUSIVE MODE;
```

### 5. Habilitar Leaked Password Protection

Usar a ferramenta de configuração de autenticação para ativar a proteção contra senhas vazadas.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/sync-bus-schedules/index.ts` | Adicionar autenticação + ocultar erros |
| Nova migração SQL | Políticas RLS + fix race condition |
| Configuração Auth | Ativar leaked password protection |

---

## Arquitetura de Segurança Final

```text
┌─────────────────────────────────────────────────────────────┐
│                    Camadas de Segurança                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [Frontend]                                                │
│       │                                                     │
│       ▼                                                     │
│   ProtectedRoute ──► Verifica login (UX only)              │
│       │                                                     │
│       ▼                                                     │
│   [Edge Function]                                          │
│       │                                                     │
│       ├──► Valida JWT                                      │
│       ├──► Verifica role admin                             │
│       ▼                                                     │
│   [Database RLS]                                           │
│       │                                                     │
│       ├──► bus_lines: admin pode escrever                  │
│       ├──► bus_schedules: admin pode escrever              │
│       ├──► bus_schedules_cache: só service role            │
│       ├──► sync_metadata: só service role                  │
│       └──► user_roles: admin gerencia                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Ordem de Execução

1. Atualizar Edge Function com autenticação e erros genéricos
2. Criar migração com políticas RLS e fix do race condition
3. Ativar Leaked Password Protection
4. Testar o fluxo completo
5. Publicar o projeto
