/*
  # Security Improvements
  
  1. Index Cleanup
    - Drop unused index `idx_conversation_history_itinerary_id` on `conversation_history` table
    - This index was created but has not been used and is consuming unnecessary resources
  
  2. Security Notes
    - Note: Leaked password protection must be enabled through Supabase Dashboard
    - Dashboard path: Authentication > Settings > Enable "Check against HaveIBeenPwned.org"
    - This migration removes the unused database index only
*/

-- Drop unused index
DROP INDEX IF EXISTS idx_conversation_history_itinerary_id;