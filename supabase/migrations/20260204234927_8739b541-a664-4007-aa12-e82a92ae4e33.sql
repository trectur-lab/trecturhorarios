-- Criar tabela de linhas de ônibus editável
CREATE TABLE public.bus_lines (
    id SERIAL PRIMARY KEY,
    numero TEXT NOT NULL,
    nome TEXT NOT NULL,
    via TEXT,
    cor TEXT NOT NULL DEFAULT '#3498db',
    directions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de horários
CREATE TABLE public.bus_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_line_id INTEGER NOT NULL REFERENCES public.bus_lines(id) ON DELETE CASCADE,
    day_type TEXT NOT NULL CHECK (day_type IN ('uteis', 'sabados', 'domingos')),
    direction TEXT NOT NULL,
    hora TEXT NOT NULL,
    obs TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de roles (separada do perfil por segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Função para verificar role (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Habilitar RLS
ALTER TABLE public.bus_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para bus_lines (leitura pública, escrita só admin)
CREATE POLICY "Leitura pública de linhas" 
ON public.bus_lines FOR SELECT 
USING (true);

CREATE POLICY "Admin pode inserir linhas" 
ON public.bus_lines FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar linhas" 
ON public.bus_lines FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar linhas" 
ON public.bus_lines FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para bus_schedules (leitura pública, escrita só admin)
CREATE POLICY "Leitura pública de horários" 
ON public.bus_schedules FOR SELECT 
USING (true);

CREATE POLICY "Admin pode inserir horários" 
ON public.bus_schedules FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar horários" 
ON public.bus_schedules FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar horários" 
ON public.bus_schedules FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_roles
CREATE POLICY "Usuários podem ver suas próprias roles" 
ON public.user_roles FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin pode gerenciar roles" 
ON public.user_roles FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Índices para performance
CREATE INDEX idx_bus_schedules_line_id ON public.bus_schedules(bus_line_id);
CREATE INDEX idx_bus_schedules_day_type ON public.bus_schedules(day_type);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_bus_lines_updated_at
BEFORE UPDATE ON public.bus_lines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bus_schedules_updated_at
BEFORE UPDATE ON public.bus_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();