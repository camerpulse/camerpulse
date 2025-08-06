-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text text, entity_id text DEFAULT NULL)
RETURNS text AS $$
DECLARE
    slug_text text;
BEGIN
    -- Handle null/empty input
    IF input_text IS NULL OR trim(input_text) = '' THEN
        RETURN COALESCE(entity_id, 'item');
    END IF;
    
    -- Convert to lowercase and replace non-alphanumeric with hyphens
    slug_text := lower(trim(input_text));
    slug_text := regexp_replace(slug_text, '[^a-z0-9\s-]', '', 'g');
    slug_text := regexp_replace(slug_text, '\s+', '-', 'g');
    slug_text := regexp_replace(slug_text, '-+', '-', 'g');
    slug_text := regexp_replace(slug_text, '^-+|-+$', '', 'g');
    
    -- Handle special characters
    slug_text := replace(slug_text, 'à', 'a');
    slug_text := replace(slug_text, 'á', 'a');
    slug_text := replace(slug_text, 'â', 'a');
    slug_text := replace(slug_text, 'ä', 'a');
    slug_text := replace(slug_text, 'ã', 'a');
    slug_text := replace(slug_text, 'è', 'e');
    slug_text := replace(slug_text, 'é', 'e');
    slug_text := replace(slug_text, 'ê', 'e');
    slug_text := replace(slug_text, 'ë', 'e');
    slug_text := replace(slug_text, 'ì', 'i');
    slug_text := replace(slug_text, 'í', 'i');
    slug_text := replace(slug_text, 'î', 'i');
    slug_text := replace(slug_text, 'ï', 'i');
    slug_text := replace(slug_text, 'ò', 'o');
    slug_text := replace(slug_text, 'ó', 'o');
    slug_text := replace(slug_text, 'ô', 'o');
    slug_text := replace(slug_text, 'ö', 'o');
    slug_text := replace(slug_text, 'õ', 'o');
    slug_text := replace(slug_text, 'ø', 'o');
    slug_text := replace(slug_text, 'ù', 'u');
    slug_text := replace(slug_text, 'ú', 'u');
    slug_text := replace(slug_text, 'û', 'u');
    slug_text := replace(slug_text, 'ü', 'u');
    slug_text := replace(slug_text, 'ñ', 'n');
    slug_text := replace(slug_text, 'ç', 'c');
    slug_text := replace(slug_text, 'ß', 'ss');
    slug_text := replace(slug_text, 'ý', 'y');
    slug_text := replace(slug_text, 'ÿ', 'y');
    
    -- Append entity ID if provided for uniqueness
    IF entity_id IS NOT NULL THEN
        slug_text := COALESCE(NULLIF(slug_text, ''), 'item') || '-' || entity_id;
    END IF;
    
    RETURN COALESCE(NULLIF(slug_text, ''), COALESCE(entity_id, 'item'));
END;
$$ LANGUAGE plpgsql;