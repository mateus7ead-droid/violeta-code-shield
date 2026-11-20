ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
COMMENT ON COLUMN public.profiles.address IS 'Endereço da residência informado pela usuária.';