# Security Setup Instructions

## Leaked Password Protection

To enable leaked password protection in Supabase Auth:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Settings**
4. Scroll down to the **Security** section
5. Enable the checkbox for **"Enable HaveIBeenPwned.org breach check"**
6. Click **Save**

### What This Does

When enabled, Supabase Auth will check user passwords against the HaveIBeenPwned.org database during signup and password changes. If a password has been found in a data breach, the user will be required to choose a different password.

This significantly enhances security by preventing users from using compromised passwords.

### Why It's Important

- Over 12 billion compromised passwords are tracked by HaveIBeenPwned.org
- Users often reuse passwords across multiple sites
- Compromised passwords are a major vector for account takeover attacks
- This is a simple way to dramatically reduce security risk

---

## Database Security

The following database security measures have been implemented:

### ✅ Completed

1. **Unused Index Removed**: Dropped `idx_conversation_history_itinerary_id` which was not being used
2. **Row Level Security (RLS)**: Enabled on all tables with appropriate policies
3. **Secure Foreign Keys**: All relationships properly constrained
4. **Data Validation**: Check constraints on critical fields

### Security Best Practices in Place

- All tables have RLS enabled
- Authentication state checked in all policies
- User data isolated by `user_id` checks
- Guest data protected with session-based access
- Proper indexes on frequently queried columns
