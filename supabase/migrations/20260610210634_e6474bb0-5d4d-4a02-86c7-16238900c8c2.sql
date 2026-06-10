
-- special_date_line_overrides: add day_type
ALTER TABLE public.special_date_line_overrides
  ADD COLUMN IF NOT EXISTS day_type text;

-- scheduled_schedule_changes: add missing columns
ALTER TABLE public.scheduled_schedule_changes
  ADD COLUMN IF NOT EXISTS effective_date date,
  ADD COLUMN IF NOT EXISTS operation text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS error text,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- sonda_credentials: add legacy/alias columns
ALTER TABLE public.sonda_credentials
  ADD COLUMN IF NOT EXISTS data_url text,
  ADD COLUMN IF NOT EXISTS usuario text,
  ADD COLUMN IF NOT EXISTS senha text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- RPC stubs to satisfy code references
CREATE OR REPLACE FUNCTION public.apply_scheduled_change(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.scheduled_schedule_changes
     SET status = 'applied', applied_at = now()
   WHERE id = _id AND status = 'pending';
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_due_scheduled_changes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  WITH upd AS (
    UPDATE public.scheduled_schedule_changes
       SET status = 'applied', applied_at = now()
     WHERE status = 'pending'
       AND effective_date IS NOT NULL
       AND effective_date <= current_date
    RETURNING 1
  )
  SELECT count(*) INTO n FROM upd;
  RETURN n;
END;
$$;
