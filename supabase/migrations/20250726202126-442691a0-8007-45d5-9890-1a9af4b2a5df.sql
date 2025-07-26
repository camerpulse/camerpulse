-- Add latitude and longitude columns to villages table
ALTER TABLE public.villages 
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC;

-- Add some sample coordinates for existing villages (Cameroon regions)
UPDATE public.villages 
SET latitude = 3.8480, longitude = 11.5021 
WHERE region = 'Centre' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 4.0511, longitude = 9.7679 
WHERE region = 'Littoral' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 5.9631, longitude = 10.1591 
WHERE region = 'West' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 7.3697, longitude = 12.3547 
WHERE region = 'Adamawa' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 9.3265, longitude = 13.1081 
WHERE region = 'North' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 10.5949, longitude = 14.2152 
WHERE region = 'Far North' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 6.2335, longitude = 12.4397 
WHERE region = 'Northwest' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 5.4467, longitude = 10.4211 
WHERE region = 'Southwest' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 4.1061, longitude = 15.3136 
WHERE region = 'East' AND latitude IS NULL;

UPDATE public.villages 
SET latitude = 2.9253, longitude = 16.0369 
WHERE region = 'South' AND latitude IS NULL;