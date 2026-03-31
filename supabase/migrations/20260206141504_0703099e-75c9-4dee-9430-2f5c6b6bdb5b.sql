-- ============================================================
-- CORREÇÕES DE SEGURANÇA
-- ============================================================

-- 1. Políticas RLS para bus_schedules_cache (bloquear escrita por usuários)
-- Apenas service role pode inserir/atualizar/deletar

CREATE POLICY "Block authenticated write on cache"
ON public.bus_schedules_cache
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- 2. Políticas RLS para sync_metadata (bloquear escrita por usuários)
-- Apenas service role pode inserir/atualizar/deletar

CREATE POLICY "Block authenticated write on metadata"
ON public.sync_metadata
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- 3. Corrigir race condition no setup_first_admin com lock de tabela
CREATE OR REPLACE FUNCTION public.setup_first_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Lock para prevenir race condition
  LOCK TABLE public.user_roles IN EXCLUSIVE MODE;
  
  -- Só permite se não existe nenhum admin ainda
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  
  -- Insere o primeiro admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin');
  
  RETURN true;
END;
$$;