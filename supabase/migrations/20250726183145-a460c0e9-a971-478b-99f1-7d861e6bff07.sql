-- Update Mbessa village to correct subdivision based on research findings
UPDATE villages 
SET 
  subdivision = 'Belo'
WHERE village_name = 'Mbessa' AND region = 'North West' AND division = 'Boyo';