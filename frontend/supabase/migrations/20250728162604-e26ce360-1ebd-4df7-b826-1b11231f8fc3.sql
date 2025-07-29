-- Enable public access to shipments table for tracking functionality
CREATE POLICY "Public can view shipments for tracking" 
ON public.shipments 
FOR SELECT 
USING (true);