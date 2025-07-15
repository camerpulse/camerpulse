-- Insert major Cameroon cities and towns
INSERT INTO public.cameroon_locations 
(region, division, city_town, latitude, longitude, population, is_major_city, alternative_names) VALUES
-- Centre Region
('Centre', 'Mfoundi', 'Yaoundé', 3.848, 11.502, 4100000, true, ARRAY['Yaounde', 'Yde']),
('Centre', 'Mbam-et-Inoubou', 'Bafia', 4.75, 11.23, 65000, false, ARRAY['Bafia']::TEXT[]),
('Centre', 'Haute-Sanaga', 'Nanga-Eboko', 4.69, 12.37, 30000, false, ARRAY[]::TEXT[]),

-- Littoral Region  
('Littoral', 'Wouri', 'Douala', 4.048, 9.754, 3800000, true, ARRAY['Dla', 'Economic Capital']),
('Littoral', 'Sanaga-Maritime', 'Edéa', 3.8, 10.13, 120000, false, ARRAY['Edea']::TEXT[]),
('Littoral', 'Mungo', 'Nkongsamba', 4.95, 9.94, 150000, false, ARRAY[]::TEXT[]),

-- Northwest Region
('Northwest', 'Mezam', 'Bamenda', 5.96, 10.15, 500000, true, ARRAY['Abakwa', 'Mankon']),
('Northwest', 'Bui', 'Kumbo', 6.2, 10.67, 80000, false, ARRAY[]::TEXT[]),
('Northwest', 'Donga-Mantung', 'Nkambe', 6.58, 10.77, 45000, false, ARRAY[]::TEXT[]),
('Northwest', 'Momo', 'Mbengwi', 6.17, 9.68, 35000, false, ARRAY[]::TEXT[]),

-- Southwest Region
('Southwest', 'Fako', 'Buea', 4.15, 9.24, 200000, true, ARRAY['Buea Town']::TEXT[]),
('Southwest', 'Fako', 'Limbe', 4.02, 9.2, 120000, true, ARRAY['Victoria']::TEXT[]),
('Southwest', 'Meme', 'Kumba', 4.63, 9.45, 180000, true, ARRAY[]::TEXT[]),
('Southwest', 'Manyu', 'Mamfe', 5.75, 9.3, 25000, false, ARRAY[]::TEXT[]),
('Southwest', 'Ndian', 'Mundemba', 4.57, 8.87, 15000, false, ARRAY[]::TEXT[]),

-- Far North Region
('Far North', 'Diamaré', 'Maroua', 10.6, 14.32, 400000, true, ARRAY[]::TEXT[]),
('Far North', 'Bénoué', 'Garoua', 9.3, 13.4, 350000, true, ARRAY[]::TEXT[]),
('Far North', 'Mayo-Danay', 'Yagoua', 10.33, 15.23, 80000, false, ARRAY[]::TEXT[]),
('Far North', 'Logone-et-Chari', 'Kousséri', 12.08, 15.03, 90000, false, ARRAY['Kousseri']::TEXT[]),

-- North Region
('North', 'Bénoué', 'Garoua', 9.3, 13.4, 350000, true, ARRAY[]::TEXT[]),
('North', 'Faro', 'Poli', 8.42, 13.25, 25000, false, ARRAY[]::TEXT[]),
('North', 'Mayo-Rey', 'Tcholliré', 8.38, 14.17, 20000, false, ARRAY['Tchollire']::TEXT[]),

-- Adamawa Region  
('Adamawa', 'Vina', 'Ngaoundéré', 7.32, 13.58, 300000, true, ARRAY['Ngaoundere']::TEXT[]),
('Adamawa', 'Mbéré', 'Meiganga', 6.52, 14.3, 45000, false, ARRAY[]::TEXT[]),
('Adamawa', 'Djérem', 'Tibati', 6.47, 12.63, 35000, false, ARRAY[]::TEXT[]),

-- East Region
('East', 'Haut-Nyong', 'Bertoua', 4.58, 13.68, 180000, true, ARRAY[]::TEXT[]),
('East', 'Kadey', 'Batouri', 4.43, 14.37, 35000, false, ARRAY[]::TEXT[]),
('East', 'Lom-et-Djérem', 'Bélabo', 4.93, 13.3, 25000, false, ARRAY['Belabo']::TEXT[]),

-- South Region
('South', 'Mvila', 'Ebolowa', 2.92, 11.15, 120000, true, ARRAY[]::TEXT[]),
('South', 'Dja-et-Lobo', 'Sangmélima', 2.93, 11.98, 25000, false, ARRAY['Sangmelima']::TEXT[]),
('South', 'Océan', 'Kribi', 2.95, 9.91, 65000, false, ARRAY[]::TEXT[]),

-- West Region
('West', 'Bamboutos', 'Mbouda', 5.62, 10.25, 120000, false, ARRAY[]::TEXT[]),
('West', 'Haut-Nkam', 'Bafang', 5.15, 10.18, 80000, false, ARRAY[]::TEXT[]),
('West', 'Mifi', 'Bafoussam', 5.48, 10.42, 300000, true, ARRAY[]::TEXT[]),
('West', 'Noun', 'Foumban', 5.72, 10.9, 90000, false, ARRAY[]::TEXT[]);

-- Update trigger for local sentiment
CREATE OR REPLACE FUNCTION update_local_sentiment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_local_sentiment_updated_at
  BEFORE UPDATE ON public.camerpulse_intelligence_local_sentiment
  FOR EACH ROW
  EXECUTE FUNCTION update_local_sentiment_updated_at();