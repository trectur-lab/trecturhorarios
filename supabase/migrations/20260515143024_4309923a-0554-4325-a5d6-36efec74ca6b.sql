ALTER TABLE public.sonda_credentials
  ADD COLUMN IF NOT EXISTS auth_url TEXT NOT NULL DEFAULT 'https://consultaviagem.m2mfrota.com.br/AutenticarUsuario',
  ADD COLUMN IF NOT EXISTS data_url TEXT NOT NULL DEFAULT 'https://zn5.sinopticoplus.com/servico-dados/api/v1/obterPosicaoVeiculo';