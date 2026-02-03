-- ============================================================================
-- Migration 007: Fix handle_new_user trigger to include role from metadata
-- ============================================================================
-- Purpose: Update the trigger to properly extract role from user metadata
-- and handle edge cases where profile creation might fail

-- Drop and recreate the trigger function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Extract role from metadata, default to 'client' if not provided
  BEGIN
    user_role_value := COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'client'::user_role
    );
  EXCEPTION WHEN others THEN
    user_role_value := 'client'::user_role;
  END;

  -- Insert into users table with all relevant fields
  INSERT INTO users (
    id, 
    email, 
    full_name, 
    company_name, 
    role,
    agency_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    user_role_value,
    (NEW.raw_user_meta_data->>'agency_id')::uuid
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    company_name = COALESCE(EXCLUDED.company_name, users.company_name),
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log error but don't fail the auth signup
  RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (in case it needs to be refreshed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
