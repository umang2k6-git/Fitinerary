/*
  # Create Guest Itineraries Table

  1. New Tables
    - `guest_itineraries`
      - `id` (uuid, primary key)
      - `session_id` (text, unique browser session identifier)
      - `destination` (text, destination name)
      - `destination_hero_image_url` (text, destination image)
      - `trip_brief` (text, user's trip description)
      - `tier` (text, Budget/Balanced/Luxe)
      - `days_json` (jsonb, itinerary details)
      - `total_cost` (integer, total cost in currency)
      - `duration_days` (integer, number of days)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, auto-cleanup date)

  2. Security
    - No RLS needed - guest itineraries are identified by session_id only
    - Session IDs should be randomly generated and sufficiently long to prevent guessing
    - Client-side code manages session_id in localStorage

  3. Indexes
    - Index on session_id for fast lookups
    - Index on expires_at for cleanup queries
    - Index on created_at for sorting

  4. Important Notes
    - Guest itineraries expire after 7 days
    - No foreign key to auth.users since these are anonymous
    - Session-based access control handled at application layer
    - Expired itineraries should be cleaned up periodically
*/

CREATE TABLE IF NOT EXISTS guest_itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  destination text NOT NULL,
  destination_hero_image_url text,
  trip_brief text,
  tier text NOT NULL CHECK (tier IN ('Budget', 'Balanced', 'Luxe')),
  days_json jsonb NOT NULL,
  total_cost integer NOT NULL,
  duration_days integer NOT NULL DEFAULT 2,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_itineraries_session_id ON guest_itineraries(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_itineraries_expires_at ON guest_itineraries(expires_at);
CREATE INDEX IF NOT EXISTS idx_guest_itineraries_created_at ON guest_itineraries(created_at DESC);

-- Create a function to clean up expired guest itineraries
CREATE OR REPLACE FUNCTION cleanup_expired_guest_itineraries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM guest_itineraries
  WHERE expires_at < now();
END;
$$;

-- Note: No RLS on this table - access control via session_id at application layer
-- Clients must provide valid session_id to access their guest itineraries