-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_audit_log CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create user roles enum if not exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('head', 'manager', 'normal', 'view');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user status enum if not exists
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid UNIQUE REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'normal',
  department text,
  position text,
  status user_status NOT NULL DEFAULT 'active',
  last_login timestamptz,
  permissions jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user audit log
CREATE TABLE public.user_audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  changes jsonb NOT NULL,
  performed_by uuid REFERENCES auth.users(id),
  performed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Everyone can read users
CREATE POLICY "Enable read access for all users"
  ON public.users FOR SELECT
  USING (true);

-- Enable insert for authenticated users
CREATE POLICY "Enable insert for authenticated users"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = auth_id);

-- Only admins can delete users
CREATE POLICY "Only admins can delete users"
  ON public.users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role')::text = 'head'
    )
  );

-- Audit log policies
CREATE POLICY "Enable read access for all users"
  ON public.user_audit_log FOR SELECT
  USING (true);

-- Functions and Triggers

-- Update user's last login
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_login = now()
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log user changes
CREATE OR REPLACE FUNCTION public.handle_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_audit_log (
      user_id,
      action,
      changes,
      performed_by
    ) VALUES (
      NEW.id,
      'UPDATE',
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      ),
      auth.uid()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_audit_log (
      user_id,
      action,
      changes,
      performed_by
    ) VALUES (
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      auth.uid()
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();

DROP TRIGGER IF EXISTS on_user_changes ON public.users;
CREATE TRIGGER on_user_changes
  AFTER UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_changes();