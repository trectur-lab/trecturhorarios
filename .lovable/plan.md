# Reduzir o gasto mensal de créditos do app

## O que os números mostram (15/out a 13/nov)
- Total do app: ~44,3 créditos.
- **Servidor do banco ligado: ~37,4 (85%)** — 353 horas no tamanho atual. Ele é cobrado por hora em que fica ligado, não por acesso.
- Edição do app (construção): 4,3.
- Tráfego de dados: 1,55 (3,4 GB). Mapa/funções: 0,74 (73.740 chamadas). Atualização ao vivo: 0,30.
- A franquia gratuita do Cloud é de 20 créditos/mês. Ligado 24h no tamanho atual, o servidor custa ~74 créditos/mês; no menor tamanho, ~56.

Conclusão: quase todo o gasto vem do servidor ficar ligado o tempo todo. Mexer em consultas ajuda pouco, a não ser que permita um servidor menor ou que ele "durma" quando não há uso.

## Ações propostas (em ordem de impacto)
1. **Voltar o servidor para o tamanho menor** depois de confirmar que a memória e as conexões ficam folgadas por alguns dias. Economia estimada: ~18 créditos/mês se ficar ligado 24h. Risco: voltar a faltar recurso em horário de pico — por isso o passo 2 vem antes.
2. **Diminuir o trabalho que mantém o banco ocupado**:
   - Mapa: hoje cada celular com o mapa aberto pede posição a cada 30 s e cada pedido lê a senha SONDA no banco. Guardar essa configuração em memória na função por alguns minutos e pausar o mapa quando ele não estiver visível na tela.
   - Horários: hoje cada atualização recarrega todos os ~1.200 horários. Recarregar apenas se algo mudou de fato (checar a data da última alteração antes de baixar tudo) e aumentar o intervalo da checagem de segurança de 5 para 15 min, mantendo a atualização ao vivo.
   - Isso também reduz o tráfego de dados (3,4 GB).
3. **Medir de novo após 7 dias** e comparar horas, chamadas e tráfego antes de decidir o tamanho final.

O que não muda: atualização imediata dos horários no PWA, mapa, painel admin, funcionamento offline.

## Limites
- Não posso garantir que o servidor "durma" sozinho: com usuários abrindo o app o dia todo, ele tende a ficar ligado. Pausar manualmente deixaria o app fora do ar.
- Se o objetivo é nunca bater o limite, a alternativa segura é um plano/recarga com mais créditos ou um limite de gasto configurado em Configurações do workspace.

## Detalhes técnicos
- `sonda-vehicle-position`: cache de `getCreds()` em variável de módulo com TTL de 5 min.
- `useVehiclePosition`/`useLineVehicles`: pausar polling com `document.visibilityState !== 'visible'` e quando o mapa sai da tela (IntersectionObserver).
- `useBusSchedulesPublic`: `SAFETY_POLL_MS` 15 min; antes do fetch completo em revalidações passivas, consultar `max(updated_at)` (se a coluna existir; senão criar) e pular se igual ao cache.
- Resize de volta só com aprovação, após `db_health` mostrar folga sustentada.
