
CREATE OR REPLACE FUNCTION public.apply_scheduled_change(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.scheduled_schedule_changes%ROWTYPE;
  today_brt date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  item jsonb;
BEGIN
  SELECT * INTO rec FROM public.scheduled_schedule_changes WHERE id = _id AND status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF rec.effective_date IS NULL OR rec.effective_date > today_brt THEN
    RETURN false;
  END IF;

  BEGIN
    IF COALESCE(rec.operation, 'replace_all') = 'replace_all' THEN
      DELETE FROM public.bus_schedules
       WHERE bus_line_id = rec.bus_line_id
         AND day_type    = rec.day_type
         AND direction   = rec.direction;

      FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(rec.payload->'items', '[]'::jsonb))
      LOOP
        INSERT INTO public.bus_schedules (bus_line_id, day_type, direction, hora, obs)
        VALUES (
          rec.bus_line_id,
          rec.day_type,
          rec.direction,
          item->>'hora',
          NULLIF(item->>'obs','')
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

CREATE OR REPLACE FUNCTION public.apply_due_scheduled_changes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_brt date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  r record;
  n integer := 0;
  ok boolean;
BEGIN
  FOR r IN
    SELECT id FROM public.scheduled_schedule_changes
     WHERE status = 'pending'
       AND effective_date IS NOT NULL
       AND effective_date <= today_brt
     ORDER BY effective_date, created_at
  LOOP
    ok := public.apply_scheduled_change(r.id);
    IF ok THEN n := n + 1; END IF;
  END LOOP;
  RETURN n;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('apply-scheduled-changes-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'apply-scheduled-changes-daily',
  '5 3 * * *',
  $$ SELECT public.apply_due_scheduled_changes(); $$
);
