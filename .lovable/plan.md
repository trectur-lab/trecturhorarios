

## Plano: Migrar dados do trectur.lovable.app

Como o projeto original não está acessível via ferramentas cross-project, mas as tabelas têm leitura pública, vamos criar uma **edge function** neste projeto que busca os dados da API REST pública do projeto original e os insere no banco local.

### Pré-requisito

Preciso do **project ref** (ID do Supabase) do projeto original. Como a URL pública é `trectur.lovable.app`, vou buscar os dados via fetch na API REST do Supabase original. Para isso, preciso da URL do Supabase e anon key do projeto original — OU posso extraí-los do código-fonte daquele projeto.

**Alternativa mais simples:** Como não tenho acesso ao projeto, vou pedir ao usuário a URL e anon key do projeto original, OU posso tentar acessar a API pública se o usuário me fornecer o Supabase URL do projeto original.

### Abordagem: Edge function de migração

1. **Criar edge function `migrate-data`** que:
   - Faz fetch na API REST do Supabase do projeto original (`bus_lines` e `bus_schedules`)
   - Usa o service role key local para inserir os dados no banco deste projeto
   - Limpa as tabelas locais antes de inserir (para evitar duplicatas)
   - Retorna um relatório com contagens

2. **Invocar a function** para executar a migração

### Dados necessários do usuário

Para prosseguir, preciso de uma das opções:
- O **Supabase URL** e **anon key** do projeto original (encontrados no `.env` do projeto `trectur.lovable.app`)
- Ou acesso ao projeto original no workspace

### Estrutura da edge function

```
supabase/functions/migrate-data/index.ts
- Recebe: source_url e source_anon_key no body
- Busca: GET /rest/v1/bus_lines e /rest/v1/bus_schedules da fonte
- Limpa: DELETE das tabelas locais
- Insere: INSERT dos dados buscados
- Retorna: contagens de linhas e horários migrados
```

### Próximo passo imediato

Preciso que o usuário forneça o **Supabase URL** e **anon key** do projeto original para que a edge function possa buscar os dados públicos.

