
CREATE TABLE public.letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  country TEXT,
  city TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.letters
  ADD CONSTRAINT letters_author_name_length CHECK (char_length(author_name) BETWEEN 1 AND 80),
  ADD CONSTRAINT letters_content_length CHECK (char_length(content) BETWEEN 10 AND 5000),
  ADD CONSTRAINT letters_country_length CHECK (country IS NULL OR char_length(country) <= 60),
  ADD CONSTRAINT letters_city_length CHECK (city IS NULL OR char_length(city) <= 60);

CREATE INDEX letters_created_at_idx ON public.letters (created_at DESC);

GRANT SELECT, INSERT ON public.letters TO anon;
GRANT SELECT, INSERT ON public.letters TO authenticated;
GRANT ALL ON public.letters TO service_role;

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read letters"
  ON public.letters FOR SELECT
  USING (true);

CREATE POLICY "Anyone can write a letter"
  ON public.letters FOR INSERT
  WITH CHECK (true);
