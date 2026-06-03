## Problema

O mapa aparece corretamente (Leaflet + OpenStreetMap OK), mas **sem nenhum marcador de ônibus**. A edge function `sonda-vehicle-position` autentica com sucesso (200 OK), porém o endpoint `obterPosicaoVeiculo` retorna `total: 0` — ou seja, lista vazia.

## Plano em duas etapas

### Etapa 1 — Diagnóstico (modo "debug")

Adicionar à edge function `sonda-vehicle-position` um modo opcional `debug: true` que:

- Loga o status HTTP, headers principais e os primeiros 2 KB do corpo bruto retornado pela SONDA.
- Devolve no JSON de resposta uma amostra do payload bruto (`rawSample`) e a contagem antes de qualquer filtro.

Em seguida, executar o teste via `curl_edge_functions` com `{"numeroLinha":"01","debug":true}` para inspecionar o que a SONDA está realmente devolvendo. Três cenários possíveis:

| Cenário | Como identificar | Correção |
|---|---|---|
| Resposta vem dentro de um campo aninhado | `rawSample` mostra `{"retorno":{...}}` ou `{"dados":[...]}` | Ampliar o parsing em `list = ...` para reconhecer essas chaves |
| Endpoint exige parâmetros na query | Resposta vazia mesmo com payload válido / mensagem específica nos headers | Adicionar parâmetros corretos (ex.: `idLinha`, `idEmpresa`) à URL |
| API realmente não tem veículos transmitindo agora | `rawSample` é `[]` literal | Confirmar com o usuário (operação noturna, frota desligada) |

### Etapa 2 — Correção

Aplicar o ajuste indicado pelo diagnóstico:

- **Se for aninhamento**: expandir o fallback do parser para cobrir `raw?.retorno?.veiculos`, `raw?.dados`, `raw?.lista`, etc.
- **Se faltarem parâmetros**: aceitar campos adicionais nas credenciais (`extra_query_params` opcional na tabela `sonda_credentials`) ou ler `bus_lines.sonda_id_linha` e enviar como query param para a SONDA.
- **Se for ausência real de dados**: deixar mensagem no mapa ("Nenhum veículo transmitindo no momento") e desativar o modo debug.

Por fim, remover o modo debug ou deixá-lo protegido por um header interno antes de finalizar.

## Pergunta para você

Você teria como me reenviar (ou colar aqui) o trecho da **documentação da SONDA** que descreve o endpoint `obterPosicaoVeiculo` — especificamente a parte de **parâmetros de requisição** e **formato da resposta de exemplo**? Isso pula direto a Etapa 1 e me deixa corrigir na primeira tentativa. Caso contrário sigo com o diagnóstico via logs.
