## Problema

Ao abrir a pré-visualização em nova aba, aparece a versão **antiga** do app (de antes da atualização vinda do ZIP). A causa é o **Service Worker do PWA** (`vite-plugin-pwa`): o navegador já tinha registrado um SW da versão antiga e ele continua servindo arquivos do cache até que todas as abas sejam fechadas — mesmo com `registerType: "autoUpdate"`.

O backend está saudável: a edge function `sonda-vehicle-position` está respondendo `200` com 2 veículos da Linha 01 a cada 30 s (confirmado nos network requests). O problema é puramente de cache do navegador.

## Correção (1 arquivo)

Atualizar `vite.config.ts` para que o novo SW assuma o controle imediatamente e descarte caches antigos:

```ts
workbox: {
  globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
  cleanupOutdatedCaches: true,   // apaga caches de versões anteriores
  clientsClaim: true,            // novo SW controla as abas abertas
  skipWaiting: true,             // não espera fechar as abas para ativar
},
devOptions: {
  enabled: false,                // desativa SW no dev/preview do Lovable
},
```

## O que isso resolve

- Abrir a pré-visualização em nova aba passa a entregar sempre a versão mais nova.
- Usuários que já têm o PWA instalado vão receber a atualização automaticamente no próximo carregamento, sem precisar desinstalar.
- No ambiente do preview do Lovable, o SW deixa de interferir.

## Ação necessária do usuário (uma vez)

Como a aba atual ainda está controlada pelo SW antigo, **uma** das duas ações abaixo é necessária **uma única vez** para a correção entrar em vigor — depois disso o problema não volta:

1. **Hard reload** na aba do preview: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac); **ou**
2. Abrir DevTools → aba **Application** → **Service Workers** → **Unregister**, e recarregar.

Depois disso, qualquer nova aba já abrirá direto na versão atualizada.
