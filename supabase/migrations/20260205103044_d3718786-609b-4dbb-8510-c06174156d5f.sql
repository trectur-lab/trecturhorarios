-- Função para setup do primeiro admin (SECURITY DEFINER)
-- Esta função bypassa o RLS de forma segura, permitindo criar o primeiro admin
CREATE OR REPLACE FUNCTION public.setup_first_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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