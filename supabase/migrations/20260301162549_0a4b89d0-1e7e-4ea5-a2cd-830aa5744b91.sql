-- Remove bus_schedules_cache table (scraping removed, no longer needed)
DROP TABLE IF EXISTS public.bus_schedules_cache;

-- Remove sync_metadata table (no longer used for external sync)
DROP TABLE IF EXISTS public.sync_metadata;