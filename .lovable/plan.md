## Correções no mapa de veículos

### 1. Layout (legenda no topo, controles inferior-direita)

Em `src/components/BusSchedule/LineMap.tsx`:
- Mover a barra de legenda (verde/azul/vermelho) de `bottom-3 left-3` para `top-3 left-3`.
- Manter o botão fullscreen no `top-3 right-3` (sem alteração) — porém só na visualização normal. Em fullscreen, mover o toggle para junto dos controles inferiores para liberar o topo.
- Manter o bloco de status (última atualização + botão refresh) em `bottom-3 right-3`. Agrupar o toggle de fullscreen nele.

### 2. Fullscreen exibindo só metade da tela

Causa: Leaflet calcula o tamanho do container ao montar e não revalida quando o wrapper muda de `height: 420` para `fixed inset-0`. Faltam `invalidateSize()` após o toggle e altura 100% garantida no wrapper.

Correção:
- Usar uma ref do mapa (`MapContainer` via `whenCreated`/`ref`) e chamar `map.invalidateSize()` em um `useEffect([fullscreen])` com pequeno delay (`requestAnimationFrame` + `setTimeout(0)`).
- Garantir `style={{ width: '100%', height: '100%' }}` no `MapContainer` quando fullscreen; o wrapper `fixed inset-0` já preenche a viewport.
- Bloquear scroll do body enquanto fullscreen (`document.body.style.overflow = 'hidden'`) para evitar barras que cortam o mapa em PWA mobile.

### 3. Mapa não recentraliza ao trocar de linha

Causa: a prop `center` do `MapContainer` só é lida na montagem; trocar a linha não move o mapa.

Correção:
- Adicionar componente interno `RecenterOnVehicles` que usa `useMap()` e, sempre que `vehicles` mudar e houver pelo menos um, chama `map.fitBounds(L.latLngBounds(vehicles.map(v => [v.lat, v.lng])).pad(0.2))`.
- Se houver apenas 1 veículo, usar `map.setView([lat,lng], 15)`.
- Se vier vazio, manter a view atual (não pular para o default).

### 4. Posicionamento dos ônibus fora do traçado (deslocamento sistemático)

Hipótese: a API SONDA pode estar devolvendo coordenadas em SIRGAS2000/SAD69 ou com offset fixo conhecido das frotas brasileiras. Outra hipótese comum: lat/lng vêm como inteiros (×1e6 ou ×1e7) e a divisão atual deixa a casa decimal certa mas há um shift de datum.

Plano em duas etapas:

**a. Instrumentação (1 deploy)** — adicionar log de amostra na edge function `sonda-vehicle-position` para imprimir, quando `debug=true`, o `firstItemSample` cru com `lat`, `lng`, e quaisquer campos como `latitudeGrau`, `longitudeGrau`, `datum`, `srid`. Também logar 1 par bruto vs. convertido.

**b. Ajuste no frontend ou edge** conforme o resultado:
- Se for SIRGAS2000 → diferença prática vs. WGS84 é < 1 m, não justifica deslocamento visível. Descartar.
- Se for SAD69/Córrego Alegre → aplicar transformação aproximada (offset constante por região) na edge function antes de devolver. Para Três Corações, offset típico SAD69→WGS84 é aprox. `Δlat ≈ +0.000061`, `Δlng ≈ −0.000028` (≈ 7 m N, 3 m W). Implementar como constante configurável.
- Se vier em outro formato (graus×1e6, UTM zona 23K) → converter no edge function.

Como ainda não temos certeza do datum/formato, o plano executa **(a) primeiro** e, com a amostra em mãos, aplico **(b)**. Para já dar um ganho imediato, adiciono também a opção de offset configurável via constantes no topo da edge function (`DATUM_OFFSET_LAT/LNG`) com valor 0 por padrão — fácil de ajustar quando virmos a amostra.

### Arquivos alterados

- `src/components/BusSchedule/LineMap.tsx` — reposicionamento de overlays, `invalidateSize` no fullscreen, componente `RecenterOnVehicles`.
- `supabase/functions/sonda-vehicle-position/index.ts` — log de amostra crua de 1 veículo e constantes de offset de datum (zero por padrão).

### Fora do escopo

- Não mudo a lógica de filtro por sentido (já corrigida anteriormente).
- Não mudo a UI dos seletores ou a grade de horários.
- O ajuste fino do offset só será aplicado após ver a amostra crua da API.
