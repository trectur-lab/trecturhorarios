
-- 1.1 Estender bus_lines
ALTER TABLE public.bus_lines
  ADD COLUMN IF NOT EXISTS sonda_codigo_veiculo TEXT,
  ADD COLUMN IF NOT EXISTS sonda_id_linha TEXT;

-- 1.2 sonda_credentials (apenas service_role)
CREATE TABLE IF NOT EXISTS public.sonda_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.sonda_credentials TO service_role;
ALTER TABLE public.sonda_credentials ENABLE ROW LEVEL SECURITY;
-- Nenhuma policy: nenhum acesso via anon/authenticated.

-- 1.3 scheduled_schedule_changes
CREATE TABLE IF NOT EXISTS public.scheduled_schedule_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_line_id INTEGER NOT NULL REFERENCES public.bus_lines(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('edit','replace_all')),
  day_type TEXT CHECK (day_type IN ('uteis','sabados','domingos')),
  direction TEXT,
  target_hora TEXT,
  new_hora TEXT,
  new_obs TEXT,
  payload JSONB,
  scheduled_for DATE NOT NULL,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.scheduled_schedule_changes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_schedule_changes TO authenticated;
GRANT ALL ON public.scheduled_schedule_changes TO service_role;
ALTER TABLE public.scheduled_schedule_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read scheduled changes"
  ON public.scheduled_schedule_changes FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admin insert scheduled changes"
  ON public.scheduled_schedule_changes FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update scheduled changes"
  ON public.scheduled_schedule_changes FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete scheduled changes"
  ON public.scheduled_schedule_changes FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_scheduled_changes_updated_at
  BEFORE UPDATE ON public.scheduled_schedule_changes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.4 special_dates
CREATE TABLE IF NOT EXISTS public.special_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  description TEXT,
  default_override TEXT CHECK (default_override IN ('uteis','sabados','domingos','no_service')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.special_dates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.special_dates TO authenticated;
GRANT ALL ON public.special_dates TO service_role;
ALTER TABLE public.special_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read special_dates"
  ON public.special_dates FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admin insert special_dates"
  ON public.special_dates FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update special_dates"
  ON public.special_dates FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete special_dates"
  ON public.special_dates FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_special_dates_updated_at
  BEFORE UPDATE ON public.special_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.5 special_date_line_overrides
CREATE TABLE IF NOT EXISTS public.special_date_line_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  special_date_id UUID NOT NULL REFERENCES public.special_dates(id) ON DELETE CASCADE,
  bus_line_id INTEGER NOT NULL REFERENCES public.bus_lines(id) ON DELETE CASCADE,
  override TEXT NOT NULL CHECK (override IN ('uteis','sabados','domingos','no_service')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(special_date_id, bus_line_id)
);

GRANT SELECT ON public.special_date_line_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.special_date_line_overrides TO authenticated;
GRANT ALL ON public.special_date_line_overrides TO service_role;
ALTER TABLE public.special_date_line_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read special_date_line_overrides"
  ON public.special_date_line_overrides FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admin insert overrides"
  ON public.special_date_line_overrides FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update overrides"
  ON public.special_date_line_overrides FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete overrides"
  ON public.special_date_line_overrides FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
