/*
  # Expand User Profiles and Add Interest Tags

  1. Changes to Existing Tables
    - `user_profiles` - Add new preference columns:
      - `budget_min` (integer, minimum budget preference)
      - `budget_max` (integer, maximum budget preference)
      - `accommodation_style` (text, preferred accommodation type)
      - `dining_preference` (text, preferred dining style)
      - `travel_pace` (text, relaxed/moderate/packed)
      - `accessibility_requirements` (text, any special needs)
      - `dietary_restrictions` (text, dietary preferences)
      - `preferred_activities` (text array, list of activity types)
      - `special_interests` (text array, list of interest tags)

  2. New Tables
    - `interests_tags`
      - `id` (uuid, primary key)
      - `name` (text, unique tag name)
      - `category` (text, tag category like nature, culture, etc.)
      - `icon` (text, lucide icon name)
      - `created_at` (timestamptz)
    
  3. Security
    - interests_tags table is public readable (no RLS needed for reference data)
    - Existing user_profiles RLS policies continue to work with new columns

  4. Seed Data
    - Pre-populate interests_tags with common travel interests

  5. Important Notes
    - Uses IF NOT EXISTS to safely add columns
    - Arrays allow multiple selections for activities and interests
    - Budget values stored as integers (in currency units)
    - Travel pace limited to specific values via CHECK constraint
*/

-- Add new columns to user_profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'budget_min'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN budget_min integer DEFAULT 5000;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'budget_max'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN budget_max integer DEFAULT 50000;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'accommodation_style'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN accommodation_style text DEFAULT 'mid-range';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'dining_preference'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN dining_preference text DEFAULT 'mix';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'travel_pace'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN travel_pace text DEFAULT 'moderate' CHECK (travel_pace IN ('relaxed', 'moderate', 'packed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'accessibility_requirements'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN accessibility_requirements text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'dietary_restrictions'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN dietary_restrictions text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'preferred_activities'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN preferred_activities text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'special_interests'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN special_interests text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Create interests_tags table
CREATE TABLE IF NOT EXISTS interests_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_interests_tags_category ON interests_tags(category);

-- Seed interests_tags with common travel interests
INSERT INTO interests_tags (name, category, icon) VALUES
  ('Mountains', 'nature', 'Mountain'),
  ('Beaches', 'nature', 'Waves'),
  ('Lakes', 'nature', 'Droplets'),
  ('Forests', 'nature', 'Trees'),
  ('Wildlife', 'nature', 'Bird'),
  ('Architecture', 'culture', 'Building2'),
  ('History', 'culture', 'Landmark'),
  ('Museums', 'culture', 'Museum'),
  ('Art Galleries', 'culture', 'Palette'),
  ('Local Markets', 'culture', 'ShoppingBag'),
  ('Relaxing', 'wellness', 'Armchair'),
  ('Spa', 'wellness', 'Sparkles'),
  ('Yoga', 'wellness', 'Heart'),
  ('Meditation', 'wellness', 'CloudSun'),
  ('Adventure Sports', 'adventure', 'Zap'),
  ('Hiking', 'adventure', 'Footprints'),
  ('Water Sports', 'adventure', 'Sailboat'),
  ('Cycling', 'adventure', 'Bike'),
  ('Rock Climbing', 'adventure', 'Mountain'),
  ('Food Tours', 'culinary', 'UtensilsCrossed'),
  ('Street Food', 'culinary', 'Coffee'),
  ('Fine Dining', 'culinary', 'ChefHat'),
  ('Wine Tasting', 'culinary', 'Wine'),
  ('Cooking Classes', 'culinary', 'CookingPot'),
  ('Nightlife', 'entertainment', 'Music'),
  ('Live Music', 'entertainment', 'Mic2'),
  ('Theater', 'entertainment', 'Theater'),
  ('Festivals', 'entertainment', 'PartyPopper'),
  ('Shopping', 'lifestyle', 'ShoppingCart'),
  ('Photography', 'lifestyle', 'Camera'),
  ('Spiritual', 'lifestyle', 'Church'),
  ('Local Experiences', 'lifestyle', 'Users')
ON CONFLICT (name) DO NOTHING;

-- Note: interests_tags is a reference table, no RLS needed (public read-only)
-- Users can read all tags to select their interests