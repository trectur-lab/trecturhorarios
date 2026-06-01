
ALTER TABLE public.sonda_credentials
  ADD COLUMN IF NOT EXISTS base_url TEXT,
  ADD COLUMN IF NOT EXISTS login_path TEXT DEFAULT '/login',
  ADD COLUMN IF NOT EXISTS vehicle_position_path TEXT DEFAULT '/posicao',
  ADD COLUMN IF NOT EXISTS line_route_path TEXT DEFAULT '/rota';
