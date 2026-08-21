# Horário 06:15 não aparece para o usuário

## Diagnóstico (verificado)

- No banco, a Linha 01 (Jardim Paraíso / N.Sra. Aparecida), Dias Úteis, sentido **Jardim Paraíso**, já está com **06:15** (alterado em 21/08 às 13:45 UTC). Não existe mais nenhum 06:20 nesse conjunto.
- Abrindo o app em um navegador limpo, a grade exibe **06:15** corretamente.
- Conclusão: a alteração foi salva e o app está certo. O 06:20 que você vê vem do **cache local do próprio dispositivo** (`localStorage` chave `trectur_bus_data`, usado para funcionamento offline no PWA).

Por que o cache "gruda": o app carrega o cache na abertura e só busca dados novos **uma vez, no primeiro carregamento**. Se o app estiver instalado como PWA e apenas for retomado do segundo plano (sem recarregar de fato), ou se a busca falhar naquele instante, ele continua exibindo o cache antigo por tempo indeterminado — sem nenhuma validade nem aviso.

## Correção proposta

### 1. Revalidar dados ao voltar para o app (`src/hooks/useBusSchedulesPublic.ts`)
- Buscar dados novos quando a aba/app volta a ficar visível (`visibilitychange`) e quando a conexão volta (`online`), respeitando um intervalo mínimo (ex.: 2 minutos) para não sobrecarregar.
- Assim, o usuário de PWA passa a receber a atualização sem precisar fechar/reabrir o app.

### 2. Validade e versão do cache
- Gravar no cache uma versão (`CACHE_VERSION`) e o carimbo de tempo já existente.
- Se o cache tiver versão diferente ou mais de 24 h, tratá-lo como "somente offline": ainda é exibido, mas o app força busca imediata no banco.

### 3. Aviso visual de dados em cache
- Quando o dado exibido vier de cache com mais de ~15 minutos, mostrar no cabeçalho um texto discreto tipo "Atualizado há X" com o botão de atualizar já existente em destaque, para o usuário saber que pode não estar vendo a última versão.

### 4. Ação imediata no seu aparelho
- Toque no botão de atualizar do app (ou feche e reabra), que o 06:15 aparece. Depois das mudanças acima isso passa a ser automático.

## Fora do escopo

- Nenhuma mudança no banco, nas políticas de acesso ou no painel admin (o salvamento está funcionando corretamente).
- Nenhuma mudança no mapa, nos agendamentos ou nas datas especiais.
