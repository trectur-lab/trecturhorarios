
-- Tabela de alterações de horários agendadas
CREATE TABLE public.scheduled_schedule_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_line_id integer NOT NULL,
  day_type text NOT NULL CHECK (day_type IN ('uteis','sabados','domingos')),
  direction text,
  effective_date date NOT NULL,
  operation text NOT NULL CHECK (operation IN ('edit','replace_all')),
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','applied','cancelled','failed')),
  applied_at timestamptz,
  error text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ssc_status_date ON public.scheduled_schedule_changes(status, effective_date);
CREATE INDEX idx_ssc_bus_line ON public.scheduled_schedule_changes(bus_line_id);

ALTER TABLE public.scheduled_schedule_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin pode ver alterações agendadas"
  ON public.scheduled_schedule_changes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admin pode inserir alterações agendadas"
  ON public.scheduled_schedule_changes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admin pode atualizar alterações agendadas"
  ON public.scheduled_schedule_changes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admin pode deletar alterações agendadas"
  ON public.scheduled_schedule_changes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_ssc_updated_at
  BEFORE UPDATE ON public.scheduled_schedule_changes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função que aplica uma alteração agendada (SECURITY DEFINER para o cron rodar)
CREATE OR REPLACE FUNCTION public.apply_scheduled_change(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  edit jsonb;
  item jsonb;
  upd jsonb;
BEGIN
  SELECT * INTO r FROM public.scheduled_schedule_changes WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR r.status <> 'pending' THEN
    RETURN false;
  END IF;

  BEGIN
    IF r.operation = 'edit' THEN
      FOR edit IN SELECT * FROM jsonb_array_elements(COALESCE(r.payload->'edits','[]'::jsonb))
      LOOP
        IF (edit->>'_delete')::boolean IS TRUE THEN
          DELETE FROM public.bus_schedules WHERE id = (edit->>'schedule_id')::uuid;
        ELSE
          UPDATE public.bus_schedules SET
            hora = COALESCE(edit->>'hora', hora),
            obs = CASE WHEN edit ? 'obs' THEN edit->>'obs' ELSE obs END,
            direction = COALESCE(edit->>'direction', direction),
            day_type = COALESCE(edit->>'day_type', day_type),
            updated_at = now()
          WHERE id = (edit->>'schedule_id')::uuid;
        END IF;
      END LOOP;

    ELSIF r.operation = 'replace_all' THEN
      IF jsonb_array_length(COALESCE(r.payload->'items','[]'::jsonb)) = 0 THEN
        RAISE EXCEPTION 'replace_all com lista vazia bloqueado';
      END IF;

      IF r.direction IS NOT NULL THEN
        DELETE FROM public.bus_schedules
          WHERE bus_line_id = r.bus_line_id AND day_type = r.day_type AND direction = r.direction;
      ELSE
        DELETE FROM public.bus_schedules
          WHERE bus_line_id = r.bus_line_id AND day_type = r.day_type;
      END IF;

      FOR item IN SELECT * FROM jsonb_array_elements(r.payload->'items')
      LOOP
        INSERT INTO public.bus_schedules (bus_line_id, day_type, direction, hora, obs)
        VALUES (
          r.bus_line_id,
          r.day_type,
          COALESCE(item->>'direction', r.direction),
          item->>'hora',
          COALESCE(item->>'obs','')
        );
      END LOOP;
    END IF;

    UPDATE public.scheduled_schedule_changes
      SET status = 'applied', applied_at = now(), error = NULL
      WHERE id = _id;
    RETURN true;
  EXCEPTION WHEN OTHERS THEN
    UPDATE public.scheduled_schedule_changes
      SET status = 'failed', error = SQLERRM
      WHERE id = _id;
    RETURN false;
  END;
END;
$$;

-- Função que aplica todas as pendentes vencidas (cron chama esta)
CREATE OR REPLACE FUNCTION public.apply_due_scheduled_changes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  count_applied integer := 0;
BEGIN
  FOR rec IN
    SELECT id FROM public.scheduled_schedule_changes
    WHERE status = 'pending'
      AND effective_date <= (now() AT TIME ZONE 'America/Sao_Paulo')::date
    ORDER BY effective_date, created_at
  LOOP
    PERFORM public.apply_scheduled_change(rec.id);
    count_applied := count_applied + 1;
  END LOOP;
  RETURN count_applied;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_due_scheduled_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_scheduled_change(uuid) TO authenticated;

-- Cron diário às 00:05 BRT (03:05 UTC)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'apply-scheduled-schedule-changes',
  '5 3 * * *',
  $$ SELECT public.apply_due_scheduled_changes(); $$
);
