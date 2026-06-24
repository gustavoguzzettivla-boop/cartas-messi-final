
ALTER TABLE public.letters
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.letters
  DROP CONSTRAINT IF EXISTS letters_status_check;
ALTER TABLE public.letters
  ADD CONSTRAINT letters_status_check CHECK (status IN ('pending','approved','rejected'));

-- Backfill: existing letters are approved so we don't lose them
UPDATE public.letters SET status = 'approved' WHERE status = 'pending';

-- Reset policies
DROP POLICY IF EXISTS "Anyone can read letters" ON public.letters;
DROP POLICY IF EXISTS "Anyone can write a letter" ON public.letters;
DROP POLICY IF EXISTS "Anyone can read approved letters" ON public.letters;
DROP POLICY IF EXISTS "Anyone can submit a letter" ON public.letters;

CREATE POLICY "Anyone can read approved letters"
  ON public.letters FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Anyone can submit a letter"
  ON public.letters FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending' AND featured = false);

CREATE INDEX IF NOT EXISTS letters_status_idx ON public.letters(status);
CREATE INDEX IF NOT EXISTS letters_featured_idx ON public.letters(featured) WHERE featured = true;
