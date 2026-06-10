-- 1. Add SONDA mapping fields to bus_lines
ALTER TABLE public.bus_lines
  ADD COLUMN IF NOT EXISTS sonda_codigo_veiculo text,
  ADD COLUMN IF NOT EXISTS sonda_id_linha text;

-- 2. Create sonda_credentials table (single-row config)
CREATE TABLE IF NOT EXISTS public.sonda_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_base_url text NOT NULL DEFAULT '',
  usuario text NOT NULL DEFAULT '',
  senha text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sonda_credentials ENABLE ROW LEVEL SECURITY;

-- Admin-only access (no public read - credentials are sensitive)
CREATE POLICY "Admin pode ver credenciais SONDA"
  ON public.sonda_credentials
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin pode inserir credenciais SONDA"
  ON public.sonda_credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin pode atualizar credenciais SONDA"
  ON public.sonda_credentials
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin pode deletar credenciais SONDA"
  ON public.sonda_credentials
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_sonda_credentials_updated_at
  BEFORE UPDATE ON public.sonda_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();