/*
  # Remove Destination City Column from User Profiles

  1. Changes to Tables
    - `user_profiles` - Remove column:
      - `destination_city` (text, no longer needed in the workflow)

  2. Important Notes
    - The destination_city field was added to the profile form but is not used in the destination generation logic
    - The get-personalized-destinations function generates recommendations based on start_city, dates, budget, and preferences
    - This field removal simplifies the user experience without affecting any workflows
    - Uses IF EXISTS check to safely remove column
    - Existing RLS policies will continue to work after column removal
*/

-- Remove destination_city column from user_profiles table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'destination_city'
  ) THEN
    ALTER TABLE user_profiles DROP COLUMN destination_city;
  END IF;
END $$;