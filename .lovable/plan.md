# Forçar atualização nos celulares com o app já instalado (PWA)

## O que está acontecendo (verificado no código)

O app instalado guarda duas coisas no aparelho:

1. **O código do app** (guardado pelo service worker do PWA).
2. **Os horários** (guardados em `localStorage`, chave `trectur_bus_data`).

As melhorias de revalidação automática já foram feitas no código, mas quem já tem o app
instalado continua rodando a **versão antiga do código**, que não tem essa revalidação —
por isso ainda mostra 06:20. Enquanto o aparelho não pegar o código novo, nada muda.

Além disso, hoje não existe nenhum mecanismo que avise o app instalado de que há uma
versão nova nem que force o recarregamento quando ela chega.

## Correções propostas

### 1. Checar atualização do app sempre que ele é aberto/retomado
Em `src/pwa-register.ts`: guardar a referência do registro do service worker e chamar
`registration.update()` quando o app volta a ficar visível e quando a conexão volta,
com intervalo mínimo (ex.: 1 min). Assim o app instalado busca a versão nova sem
depender de o usuário desinstalar/reinstalar.

### 2. Recarregar automaticamente ao ativar a versão nova
Ainda em `src/pwa-register.ts`: ouvir `controllerchange` e recarregar a página uma única
vez (com trava para não entrar em loop). Como o service worker já usa `skipWaiting` e
`clientsClaim`, a versão nova assume assim que baixada e a tela recarrega sozinha.

### 3. Aviso discreto "Nova versão disponível"
Quando um novo service worker terminar de instalar, mostrar um toast com botão
"Atualizar agora", para o caso de o usuário estar no meio de uma consulta.

### 4. Encurtar a confiança no cache de horários
Em `src/hooks/useBusSchedulesPublic.ts`:
- Subir `CACHE_VERSION` (descarta de vez qualquer cache antigo dos aparelhos).
- Reduzir o intervalo mínimo de revalidação de 2 min para 30 s.
- Se o cache tiver mais de ~10 min, buscar do banco antes de renderizar quando houver
  conexão (o cache continua sendo exibido imediatamente, mas é substituído em seguida).

### 5. Publicar
Nada disso chega aos celulares sem uma nova publicação. Depois de publicado, o
aparelho instalado pega a versão nova na primeira vez que abrir com internet
(normalmente na primeira ou segunda abertura).

### 6. Solução imediata para quem não puder esperar
Abrir o app e tocar em "Atualizar" no rodapé, ou abrir
`https://trecturhorarios.lovable.app/?sw=off` no navegador — isso remove o service
worker antigo do aparelho.

## Detalhes técnicos

- Sem mudanças no banco, nas políticas de acesso ou no painel admin.
- Sem alteração de `start_url`, `id`, `scope` ou `display` no manifest (mudar isso
  exigiria reinstalação do app).
- Sem service worker escrito à mão: continua o gerado pelo `vite-plugin-pwa`, mantendo
  `NetworkFirst` para navegações e os guards de preview/iframe já existentes.
