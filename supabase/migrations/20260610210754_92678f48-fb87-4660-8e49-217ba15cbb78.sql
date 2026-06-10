
ALTER TABLE public.scheduled_schedule_changes ALTER COLUMN change_type DROP NOT NULL;
ALTER TABLE public.sonda_credentials ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.sonda_credentials ALTER COLUMN password DROP NOT NULL;
ALTER TABLE public.special_date_line_overrides ALTER COLUMN override DROP NOT NULL;
