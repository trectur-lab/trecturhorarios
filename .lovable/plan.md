## Objetivo
Mover o botão de tela cheia para **dentro do mapa**, no canto superior direito, com visual mais polido.

## Mudanças (`src/components/BusSchedule/LineMap.tsx`)

- **Remover** o botão de tela cheia do cabeçalho do card (manter apenas o de atualizar).
- **Adicionar** um botão flutuante sobreposto ao mapa:
  - Posição: `absolute top-3 right-3 z-[400]` (acima das tiles do Leaflet, abaixo de popups).
  - Visual: quadrado ~36px, `bg-background/95 backdrop-blur-sm`, `border border-border`, `rounded-lg`, `shadow-lg`, hover `bg-background` + leve `scale-105`, transição suave.
  - Ícone `Maximize2` (modo normal) / `Minimize2` (tela cheia), `w-4 h-4`, cor `text-foreground`.
  - `aria-label` e `title` dinâmicos ("Tela cheia" / "Fechar tela cheia (Esc)").
- Em fullscreen, o botão continua no mesmo canto superior direito do mapa expandido (já funciona porque o container do mapa é `relative`).
- Sem mudanças em hooks, lógica de veículos ou backend.

## Detalhes técnicos
- Tokens semânticos (`bg-background`, `border-border`, `text-foreground`) — sem cores hardcoded.
- z-index escolhido para não conflitar com controles do Leaflet (zoom fica `top-left` por padrão, então sem sobreposição).
