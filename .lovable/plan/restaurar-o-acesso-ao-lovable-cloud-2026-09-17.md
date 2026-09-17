# Restaurar o acesso ao Lovable Cloud

## Diagnóstico confirmado

- O Lovable Cloud está ativo; banco de dados e autenticação respondem normalmente.
- Os dados continuam preservados: a consulta direta encontrou 18 linhas cadastradas.
- O login por e-mail foi aceito, mas a consulta seguinte à base falhou com `PGRST002` e HTTP 503.
- A falha está no serviço que disponibiliza os dados ao aplicativo: ele não conseguiu carregar o catálogo das tabelas. Não é necessário recriar ou migrar a base.

## Plano

1. Reiniciar de forma controlada o Lovable Cloud para reconstruir o catálogo usado pelo aplicativo.
2. Aguardar até banco de dados e autenticação voltarem ao estado saudável.
3. Testar a consulta pública de linhas e horários pelo mesmo caminho utilizado pelo aplicativo.
4. Testar o login administrativo e confirmar que a função de administrador é reconhecida.
5. Abrir o painel administrativo e validar que os horários carregam e podem ser consultados.
6. Confirmar que as atualizações em tempo real voltaram a conectar após a recuperação.
7. Se o erro persistir mesmo após o reinício, analisar os registros do serviço de dados e aplicar uma correção específica, sem alterar nem apagar os dados existentes.

## Preservação

- Nenhuma tabela, horário, usuário, credencial SONDA ou configuração será apagada.
- Não haverá troca de banco nem alteração das regras de acesso nesta recuperação.
