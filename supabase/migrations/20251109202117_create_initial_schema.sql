/*
  # Create Fitinerary Initial Schema

  1. New Tables
    - `itineraries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `destination` (text, destination name)
      - `destination_hero_image_url` (text, high-res image URL)
      - `trip_brief` (text, user's travel preferences)
      - `tier` (text, Budget/Balanced/Luxe)
      - `days_json` (jsonb, array of daily activities)
      - `total_cost` (numeric, estimated total cost)
      - `duration_days` (integer, trip duration)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `destinations`
      - `id` (uuid, primary key)
      - `name` (text, destination name)
      - `hero_image_url` (text, high-resolution luxury photography)
      - `tagline` (text, elegant tagline)
      - `region` (text, geographical region)
      - `description` (text, detailed description)
      - `is_featured` (boolean, featured on suggestions page)
      - `created_at` (timestamptz)
    
    - `conversation_history`
      - `id` (uuid, primary key)
      - `itinerary_id` (uuid, foreign key to itineraries)
      - `user_message` (text, user's refinement request)
      - `ai_response` (text, AI's response)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own itineraries
    - Add policies for authenticated users to access their own conversation history
    - Add policy for all users to read destinations (public data)

  3. Indexes
    - Create indexes on user_id, destination, created_at for performance
*/

-- Create itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination text NOT NULL,
  destination_hero_image_url text,
  trip_brief text,
  tier text NOT NULL CHECK (tier IN ('Budget', 'Balanced', 'Luxe')),
  days_json jsonb DEFAULT '[]'::jsonb,
  total_cost numeric(10, 2),
  duration_days integer DEFAULT 2,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  hero_image_url text NOT NULL,
  tagline text,
  region text,
  description text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create conversation_history table
CREATE TABLE IF NOT EXISTS conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES itineraries(id) ON DELETE CASCADE NOT NULL,
  user_message text NOT NULL,
  ai_response text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_destination ON itineraries(destination);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON itineraries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_history_itinerary_id ON conversation_history(itinerary_id);

-- Enable Row Level Security
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Itineraries policies
CREATE POLICY "Users can view own itineraries"
  ON itineraries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own itineraries"
  ON itineraries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries"
  ON itineraries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries"
  ON itineraries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Destinations policies (public read)
CREATE POLICY "Anyone can view destinations"
  ON destinations FOR SELECT
  TO authenticated, anon
  USING (true);

-- Conversation history policies
CREATE POLICY "Users can view own conversation history"
  ON conversation_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = conversation_history.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversation history for own itineraries"
  ON conversation_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = conversation_history.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own conversation history"
  ON conversation_history FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = conversation_history.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );