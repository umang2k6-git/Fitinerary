/*
  # Add Destination City Column to User Profiles

  1. Changes to Tables
    - `user_profiles` - Add new column:
      - `destination_city` (text, where user wants to travel)

  2. Important Notes
    - Uses IF NOT EXISTS to safely add column
    - No default value required as this is user input
    - Existing RLS policies continue to work with new column
*/

-- Add destination_city column to user_profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'destination_city'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN destination_city text;
  END IF;
END $$;