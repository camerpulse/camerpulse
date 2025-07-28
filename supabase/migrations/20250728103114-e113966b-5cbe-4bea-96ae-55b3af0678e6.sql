-- Add missing RLS policies for label tables

-- Create missing policies that were in the original failed migration
DO $$
BEGIN
    -- Create policies only if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'agency_branding_settings' 
        AND policyname = 'Agency staff can manage their branding'
    ) THEN
        CREATE POLICY "Agency staff can manage their branding" ON public.agency_branding_settings
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM shipping_company_staff scs 
                    WHERE scs.user_id = auth.uid() 
                    AND scs.company_id = agency_id
                    AND scs.role IN ('admin', 'manager')
                )
            );
    END IF;
END $$;