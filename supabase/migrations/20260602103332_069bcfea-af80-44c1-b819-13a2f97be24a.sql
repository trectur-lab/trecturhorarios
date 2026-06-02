
ALTER TABLE public.sonda_credentials
  DROP COLUMN IF EXISTS base_url,
  DROP COLUMN IF EXISTS login_path,
  DROP COLUMN IF EXISTS vehicle_position_path,
  DROP COLUMN IF EXISTS line_route_path;

ALTER TABLE public.sonda_credentials
  ADD COLUMN IF NOT EXISTS auth_url TEXT NOT NULL DEFAULT 'https://consultaviagem.m2mfrota.com.br/AutenticarUsuario',
  ADD COLUMN IF NOT EXISTS position_url TEXT NOT NULL DEFAULT 'https://zn5.sinopticoplus.com/servico-dados/api/v1/obterPosicaoVeiculo',
  ADD COLUMN IF NOT EXISTS dashboard_url TEXT NOT NULL DEFAULT 'https://zn5.sinopticoplus.com/servico-dados/api/v1/obterDashboard';
