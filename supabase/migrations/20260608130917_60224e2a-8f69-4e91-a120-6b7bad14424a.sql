
-- Restrict sonda_credentials to admins only via RLS; service_role (edge functions) bypasses RLS.
REVOKE ALL ON public.sonda_credentials FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sonda_credentials TO authenticated;
GRANT ALL ON public.sonda_credentials TO service_role;

CREATE POLICY "Admins can view sonda credentials"
  ON public.sonda_credentials FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sonda credentials"
  ON public.sonda_credentials FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sonda credentials"
  ON public.sonda_credentials FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sonda credentials"
  ON public.sonda_credentials FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
