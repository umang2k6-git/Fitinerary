/*
  # Fix Database Security Issues

  ## Overview
  This migration addresses multiple security and performance issues identified by Supabase:

  ## Changes Made

  ### 1. Add Missing Index
  - **Foreign Key Index**: Add index on `conversation_history.itinerary_id` 
    - Improves query performance for joins with itineraries table
    - Prevents suboptimal query performance on foreign key lookups

  ### 2. Remove Unused Indexes
  - **guest_itineraries table**: Remove three unused indexes:
    - `idx_guest_itineraries_session_id` (not being used)
    - `idx_guest_itineraries_expires_at` (not being used)
    - `idx_guest_itineraries_created_at` (not being used)
  - **travel_trivia table**: Remove unused index:
    - `idx_travel_trivia_category` (not being used)
  - **weather_forecasts table**: Remove unused index:
    - `idx_weather_forecasts_created_at` (not being used)
  - Removing unused indexes reduces storage overhead and improves write performance

  ### 3. Fix Function Search Path
  - **cleanup_expired_guest_itineraries function**: Recreate with immutable search path
    - Adds `SET search_path = public, pg_catalog` to prevent security vulnerabilities
    - Ensures function always executes in a secure, predictable schema context

  ### 4. Enable RLS on Public Table
  - **interests_tags table**: Enable Row Level Security
    - Add public read-only policy for authenticated and anon users
    - Restrict write access to service role only
    - Prevents unauthorized modifications while maintaining read access

  ## Security Impact
  - ✅ Improved query performance on foreign key joins
  - ✅ Reduced database overhead from unused indexes
  - ✅ Fixed function security vulnerability
  - ✅ Enabled RLS on public table
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEX
-- ============================================================================

-- Add index for conversation_history.itinerary_id foreign key
-- This improves query performance when joining with itineraries table
CREATE INDEX IF NOT EXISTS idx_conversation_history_itinerary_id 
  ON conversation_history(itinerary_id);

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

-- Drop unused indexes on guest_itineraries table
DROP INDEX IF EXISTS idx_guest_itineraries_session_id;
DROP INDEX IF EXISTS idx_guest_itineraries_expires_at;
DROP INDEX IF EXISTS idx_guest_itineraries_created_at;

-- Drop unused index on travel_trivia table
DROP INDEX IF EXISTS idx_travel_trivia_category;

-- Drop unused index on weather_forecasts table
DROP INDEX IF EXISTS idx_weather_forecasts_created_at;

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Drop and recreate the cleanup function with proper search path
DROP FUNCTION IF EXISTS cleanup_expired_guest_itineraries();

CREATE OR REPLACE FUNCTION cleanup_expired_guest_itineraries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  DELETE FROM guest_itineraries
  WHERE expires_at < now();
END;
$$;

-- ============================================================================
-- 4. ENABLE RLS ON INTERESTS_TAGS TABLE
-- ============================================================================

-- Enable Row Level Security on interests_tags table
ALTER TABLE interests_tags ENABLE ROW LEVEL SECURITY;

-- Allow all users (authenticated and anon) to read interests_tags
-- This is a reference table that should be publicly readable
CREATE POLICY "Allow public read access to interests tags"
  ON interests_tags
  FOR SELECT
  TO public
  USING (true);

-- Only service role can insert/update/delete interests tags
-- This prevents unauthorized modifications
CREATE POLICY "Only service role can modify interests tags"
  ON interests_tags
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
