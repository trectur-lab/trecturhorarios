## Objetivo

No mapa, exibir **apenas** os veículos do sentido correspondente à partida selecionada — em vez de esmaecer os do outro sentido por correspondência de texto.

Regra:
- 1ª opção de "Ponto Inicial / Partida" → somente `sentido = "ida"`
- 2ª+ opção → somente `sentido = "volta"`

## Mudanças

### 1. `src/components/BusSchedule/index.tsx`

Calcular o sentido alvo a partir do índice da partida selecionada e repassar ao `LineMap`:

```ts
const directionIndex = selectedLinha?.directions.indexOf(selectedDirection) ?? -1;
const mapSentido: "ida" | "volta" | null =
  directionIndex < 0 ? null : directionIndex === 0 ? "ida" : "volta";
```

Substituir `mapSentido={selectedDirection}` por `mapSentido={mapSentido}` no `<LineMap />`.

### 2. `src/components/BusSchedule/LineMap.tsx`

- Trocar a prop `mapSentido?: string` por `mapSentido?: "ida" | "volta" | null`.
- Filtrar `vehicles` ocultando os que não batem com `mapSentido` (comparação case-insensitive em `v.sentido`).
- Veículos sem `sentido` informado: ocultar quando `mapSentido` está definido.
- Remover qualquer lógica de "dim" — agora só renderiza os que passam no filtro.

### 3. `src/hooks/useLineVehicles.ts`

Ajustar o filtro atual (que compara `trajeto` com o nome do bairro) para o novo contrato:
- Aceitar `mapSentido: "ida" | "volta" | null`.
- Filtrar por `v.sentido === mapSentido` (lowercase) quando definido.
- Sem `mapSentido` → retorna todos.

## Notas

- Confirmado via edge function `sonda-vehicle-position`: `sentido` vem como `"ida"` ou `"volta"` em lowercase.
- Filtros existentes (garagem 75m, idade máx. 10min) permanecem inalterados.
- Nenhuma mudança em edge function, banco ou outros hooks.
