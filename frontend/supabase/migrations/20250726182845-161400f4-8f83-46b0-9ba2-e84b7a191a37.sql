-- Update Mbessa village to correct location
UPDATE villages 
SET 
  region = 'North West',
  division = 'Boyo',
  subdivision = 'Fundong'
WHERE village_name = 'Mbessa';