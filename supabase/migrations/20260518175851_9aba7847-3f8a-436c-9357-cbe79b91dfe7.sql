
CREATE TABLE public.special_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.special_date_line_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  special_date_id uuid NOT NULL REFERENCES public.special_dates(id) ON DELETE CASCADE,
  bus_line_id integer NOT NULL REFERENCES public.bus_lines(id) ON DELETE CASCADE,
  day_type text NOT NULL CHECK (day_type IN ('uteis','sabados','domingos','no_service')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (special_date_id, bus_line_id)
);

CREATE INDEX idx_special_date_overrides_date ON public.special_date_line_overrides(special_date_id);
CREATE INDEX idx_special_date_overrides_line ON public.special_date_line_overrides(bus_line_id);

ALTER TABLE public.special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_date_line_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de datas especiais"
  ON public.special_dates FOR SELECT USING (true);
CREATE POLICY "Admin pode inserir datas especiais"
  ON public.special_dates FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin pode atualizar datas especiais"
  ON public.special_dates FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin pode deletar datas especiais"
  ON public.special_dates FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Leitura pública de overrides"
  ON public.special_date_line_overrides FOR SELECT USING (true);
CREATE POLICY "Admin pode inserir overrides"
  ON public.special_date_line_overrides FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin pode atualizar overrides"
  ON public.special_date_line_overrides FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin pode deletar overrides"
  ON public.special_date_line_overrides FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_special_dates_updated_at
  BEFORE UPDATE ON public.special_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_date_overrides_updated_at
  BEFORE UPDATE ON public.special_date_line_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
