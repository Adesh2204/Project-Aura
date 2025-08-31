-- Add voice activation fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS voice_activation_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS voice_activation_language TEXT DEFAULT 'en-US';

-- Update existing users to have default values
UPDATE public.users 
SET 
  phone_number = COALESCE(phone_number, ''),
  voice_activation_enabled = COALESCE(voice_activation_enabled, false),
  voice_activation_language = COALESCE(voice_activation_language, 'en-US')
WHERE phone_number IS NULL OR voice_activation_enabled IS NULL OR voice_activation_language IS NULL;
