-- Étape "review" du workflow éditorial
ALTER TYPE public.content_status ADD VALUE IF NOT EXISTS 'review';

-- Traçabilité des décisions sur les devis
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS expired_at timestamptz;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS decision_reason text;