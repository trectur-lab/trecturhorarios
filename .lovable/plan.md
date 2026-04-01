

## Plano: Ativar usuário sem confirmação de email

O problema é que o cadastro exige confirmação por email, mas o sistema de email não está configurado. A solução é habilitar a confirmação automática de email (auto-confirm) no backend.

### Abordagem

1. **Ativar auto-confirm de email** no backend usando a ferramenta `configure_auth` com `double_confirm_changes: false` e `enable_signup: true`, desabilitando a necessidade de confirmação por email.

2. **Após ativação**, o usuário poderá se cadastrar novamente em `/admin/setup` e o login funcionará imediatamente sem precisar confirmar por email.

### Observação

Se o usuário `naorestona@trectur.com.br` já foi cadastrado mas está pendente de confirmação, será necessário excluí-lo e recadastrá-lo, ou confirmar manualmente via backend.

### Passos técnicos

- Chamar `configure_auth` com `autoconfirm: true` (desativa verificação de email)
- Verificar se o usuário já existe no sistema de autenticação
- Se existir com status não confirmado, orientar recadastro ou confirmar via SQL

