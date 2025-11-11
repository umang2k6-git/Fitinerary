/*
  # Create site visits tracking table

  1. New Tables
    - `site_visits`
      - `id` (uuid, primary key) - Unique identifier for the record
      - `visit_count` (bigint) - Total number of site visits
      - `last_updated` (timestamptz) - Timestamp of last visit increment
      - `created_at` (timestamptz) - Record creation timestamp
  
  2. Security
    - Enable RLS on `site_visits` table
    - Add policy to allow anyone to read the visit count
    - Add policy to allow the service role to update the count
  
  3. Important Notes
    - This table will contain a single row to track total site visits
    - The visit count will be incremented via an edge function
    - Public read access is needed for displaying the counter
*/

CREATE TABLE IF NOT EXISTS site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_count bigint DEFAULT 0 NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the visit count
CREATE POLICY "Anyone can read visit count"
  ON site_visits
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert initial record if it doesn't exist
INSERT INTO site_visits (visit_count)
SELECT 0
WHERE NOT EXISTS (SELECT 1 FROM site_visits);
