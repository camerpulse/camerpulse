-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS update_edit_suggestions_updated_at ON public.edit_suggestions;
DROP FUNCTION IF EXISTS public.update_edit_suggestions_updated_at();

-- Create new trigger function
CREATE OR REPLACE FUNCTION public.update_edit_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_edit_suggestions_updated_at
  BEFORE UPDATE ON public.edit_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_edit_suggestions_updated_at();