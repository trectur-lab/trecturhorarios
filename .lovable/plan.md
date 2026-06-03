## Diagnóstico

A edge function `sonda-vehicle-position` está funcionando: retorna **3 veículos da linha 01** (todos com `sentido: "ida"` ou `"volta"` e `trajeto` tipo `"Linha 01 - Partidas Jardim Paraíso - (Via Polivalente e Jardim Europa II)"`).

O bug está no **hook `useLineVehicles`**, no filtro por sentido:

```ts
const filtered = mapSentido
  ? list.filter((v) => !v.sentido || v.sentido.toLowerCase().includes(mapSentido.toLowerCase()))
  : list;
```

- `mapSentido` recebe o `selectedDirection` da UI, que é o nome do bairro (`"Jardim Paraíso"`, `"Jardim Europa II"`, etc.) — o que está cadastrado em `bus_lines.directions`.
- O campo `sentido` da SONDA é apenas `"ida"` / `"volta"`, nunca contém nome de bairro.
- Resultado: nenhum veículo passa no filtro, e o mapa fica vazio mesmo com o endpoint devolvendo dados certos.

## Correção

Trocar o critério de filtro do frontend para casar contra o `trajeto` (que contém o nome do destino, ex.: `"Partidas Jardim Paraíso"`), com fallback permissivo quando o `trajeto` vier vazio.

### Mudança em `src/hooks/useLineVehicles.ts`

```ts
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const filtered = mapSentido
  ? list.filter((v) => !v.trajeto || norm(v.trajeto).includes(norm(mapSentido)))
  : list;
```

- Normaliza acentos para evitar falhas em "São", "Três", etc.
- Mantém veículos sem `trajeto` (ônibus que acabaram de ligar) em vez de descartá-los.
- Não toca em nenhuma lógica de backend.

## Por que não mexer no backend

O endpoint da SONDA já está estável (`200 OK`, 45 veículos totais, parsing correto via `raw.veiculos`, campos `latitude`/`longitude` mapeados). Não há motivo para alterar a edge function.

## Limpeza opcional

Remover o `debug: true` do `.lovable/plan.md` e o bloco `debug` do response da edge function não é necessário para a correção, mas posso deixar para um passo posterior se quiser manter o código mais enxuto.
