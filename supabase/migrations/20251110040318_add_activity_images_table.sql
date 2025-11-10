/*
  # Add activity images table

  1. New Tables
    - `activity_images`
      - `id` (uuid, primary key)
      - `activity_hash` (text, unique) - Hash of activity details for caching
      - `image_urls` (jsonb) - Array of generated image URLs
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `activity_images` table
    - Add policy for authenticated users to read images
    - Add policy for authenticated users to insert images
*/

CREATE TABLE IF NOT EXISTS activity_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_hash text UNIQUE NOT NULL,
  image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read activity images"
  ON activity_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity images"
  ON activity_images FOR INSERT
  TO authenticated
  WITH CHECK (true);