GRANT SELECT, INSERT ON public.letters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.letters TO authenticated;
GRANT ALL ON public.letters TO service_role;