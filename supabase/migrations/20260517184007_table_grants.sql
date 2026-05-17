-- ============================================================
-- FIX DATA API GRANTS (SUPABASE SECURITY UPDATE MAY 30, 2026)
-- ============================================================

-- Ensure roles have usage access to the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant explicit permissions on all EXISTING tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

-- Set explicit default permissions for all FUTURE tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
