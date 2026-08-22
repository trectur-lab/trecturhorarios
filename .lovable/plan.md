# Forçar os PWAs já instalados a voltar a atualizar na hora

## O que foi verificado agora

- Banco: Linha 01, Dias Úteis, sentido Jardim Paraíso está com **06:15** (alterado em 21/08). O 06:20 que resta é de outro sentido (Jardim Europa II) — correto.
- Site publicado: o pacote JavaScript no ar (`/assets/index-DAes9Gat.js`) **já contém** todas as melhorias novas (revalidação ao reabrir, nova versão do cache, aviso "Nova versão disponível", recarregamento automático).
- Ou seja: a correção está publicada, mas os celulares com o app instalado continuam rodando o **código antigo**, entregue pelo service worker antigo que ficou gravado no aparelho. Como o app instalado normalmente é apenas "retomado" (não recarregado), ele nunca chega a buscar o código novo — fica preso.

Foi exatamente aí que a atualização instantânea parou: antes o app não tinha service worker travando o código; depois que ele passou a existir, o aparelho passou a servir a versão gravada.

## Correção proposta

### 1. Publicar um service worker de limpeza (kill-switch) por uma versão
Substituir o service worker publicado em `/sw.js` por um worker de auto-remoção que:
- apaga apenas os caches do próprio app (não mexe em nada de terceiros),
- assume o controle e **recarrega as páginas abertas**,
- e por fim se desregistra do aparelho.

Efeito: na primeira vez que o aparelho instalado abrir com internet, ele recebe esse worker, se limpa sozinho e passa a carregar sempre a versão atual direto da rede — o 06:15 aparece na hora.

### 2. Ficar sem cache de código nesta versão
Enquanto o kill-switch estiver publicado, o app deixa de funcionar offline (a tela precisa de internet para abrir). Os horários continuam guardados em `localStorage`, então a grade ainda aparece em conexão ruim.

### 3. Rebater o offline depois (opcional, versão seguinte)
Depois que os aparelhos estiverem limpos (alguns dias), dá para reativar o modo offline com o service worker gerado pelo `vite-plugin-pwa`, já com checagem de atualização a cada abertura e recarregamento automático — o que evita que o problema volte.

Se você preferir **não voltar** com o offline, o app fica sempre igual ao site: qualquer mudança no banco aparece imediatamente.

### 4. Publicar
Nada chega aos celulares sem uma nova publicação. Depois de publicar, cada aparelho se corrige sozinho na primeira abertura com internet.

### 5. Atalho imediato para hoje
Abrir `https://trecturhorarios.lovable.app/?sw=off` no navegador do celular (mesmo aparelho onde o app está instalado) já remove o service worker antigo.

## Detalhes técnicos

- `public/sw.js`: worker de limpeza conforme padrão (deleta apenas caches Workbox do próprio escopo, `clients.claim()`, `client.navigate()`, `unregister()` no `finally`).
- `vite.config.ts`: desativar a geração do service worker pelo `vite-plugin-pwa` nesta versão, mantendo o manifest e os ícones (o app continua instalável; `start_url`, `id`, `scope` e `display` ficam inalterados para não exigir reinstalação).
- `src/pwa-register.ts`: passa a apenas desregistrar workers antigos, sem registrar nenhum novo.
- Sem mudanças no banco, nas políticas de acesso, no painel admin ou nos agendamentos.

## Como vou testar

- Simular no navegador headless: instalar o service worker antigo, publicar o novo, reabrir e conferir que o worker some, o cache é apagado e a grade mostra 06:15.
