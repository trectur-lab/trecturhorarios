ALTER TABLE public.bus_schedules REPLICA IDENTITY FULL;
ALTER TABLE public.bus_lines REPLICA IDENTITY FULL;
ALTER TABLE public.special_dates REPLICA IDENTITY FULL;
ALTER TABLE public.special_date_line_overrides REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='bus_schedules') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_schedules;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='bus_lines') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_lines;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='special_dates') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.special_dates;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='special_date_line_overrides') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.special_date_line_overrides;
  END IF;
END $$;