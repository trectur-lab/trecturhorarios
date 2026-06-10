
REVOKE ALL ON FUNCTION public.apply_scheduled_change(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.apply_due_scheduled_changes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_scheduled_change(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_due_scheduled_changes() TO authenticated;
