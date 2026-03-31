-- Create table to cache bus schedules
CREATE TABLE public.bus_schedules_cache (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    line_number TEXT NOT NULL,
    schedule_data JSONB NOT NULL,
    source_url TEXT,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on line_number
CREATE UNIQUE INDEX idx_bus_schedules_cache_line ON public.bus_schedules_cache(line_number);

-- Enable RLS
ALTER TABLE public.bus_schedules_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (schedules are public information)
CREATE POLICY "Anyone can view bus schedules" 
ON public.bus_schedules_cache 
FOR SELECT 
USING (true);

-- Table to track last sync time
CREATE TABLE public.sync_metadata (
    id TEXT PRIMARY KEY DEFAULT 'bus_schedules',
    last_sync_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_hash TEXT,
    sync_status TEXT DEFAULT 'success'
);

-- Enable RLS
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view sync metadata" 
ON public.sync_metadata 
FOR SELECT 
USING (true);

-- Insert initial metadata
INSERT INTO public.sync_metadata (id, last_sync_at, sync_status) 
VALUES ('bus_schedules', now(), 'pending');