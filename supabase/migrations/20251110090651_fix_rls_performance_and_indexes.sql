/*
  # Fix RLS Performance and Remove Unused Indexes

  1. RLS Performance Optimization
    - Replace all `auth.uid()` with `(select auth.uid())` in RLS policies
    - This prevents re-evaluation for each row and improves query performance at scale
    - Applies to all policies on `itineraries` and `conversation_history` tables

  2. Index Cleanup
    - Remove unused indexes that are not being utilized by queries
    - Keep only the essential `idx_itineraries_user_id` index
    - Remove: `idx_itineraries_destination`, `idx_itineraries_created_at`, `idx_conversation_history_itinerary_id`

  3. Security Notes
    - All RLS policies remain functionally identical
    - Performance improvement is transparent to application code
    - No breaking changes to existing functionality
*/

-- Drop and recreate itineraries policies with optimized auth checks
DROP POLICY IF EXISTS "Users can view own itineraries" ON itineraries;
DROP POLICY IF EXISTS "Users can create own itineraries" ON itineraries;
DROP POLICY IF EXISTS "Users can update own itineraries" ON itineraries;
DROP POLICY IF EXISTS "Users can delete own itineraries" ON itineraries;

CREATE POLICY "Users can view own itineraries"
  ON itineraries FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own itineraries"
  ON itineraries FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own itineraries"
  ON itineraries FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own itineraries"
  ON itineraries FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate conversation_history policies with optimized auth checks
DROP POLICY IF EXISTS "Users can view own conversation history" ON conversation_history;
DROP POLICY IF EXISTS "Users can create conversation history for own itineraries" ON conversation_history;
DROP POLICY IF EXISTS "Users can delete own conversation history" ON conversation_history;

CREATE POLICY "Users can view own conversation history"
  ON conversation_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = conversation_history.itinerary_id
      AND itineraries.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create conversation history for own itineraries"
  ON conversation_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = conversation_history.itinerary_id
      AND itineraries.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own conversation history"
  ON conversation_history FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itineraries
      WHERE itineraries.id = conversation_history.itinerary_id
      AND itineraries.user_id = (select auth.uid())
    )
  );

-- Remove unused indexes
DROP INDEX IF EXISTS idx_itineraries_destination;
DROP INDEX IF EXISTS idx_itineraries_created_at;
DROP INDEX IF EXISTS idx_conversation_history_itinerary_id;