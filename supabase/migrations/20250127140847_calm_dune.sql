-- Create user roles enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('head', 'manager', 'normal', 'view');
  END IF;
END $$;

-- Create user status enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked');
  END IF;
END $$;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid UNIQUE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'normal',
  department text,
  position text,
  status user_status NOT NULL DEFAULT 'active',
  last_login timestamptz,
  permissions jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_auth_user
    FOREIGN KEY (auth_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL
);

-- Create user audit log if not exists
CREATE TABLE IF NOT EXISTS public.user_audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  action text NOT NULL,
  changes jsonb NOT NULL,
  performed_by uuid,
  performed_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_performer
    FOREIGN KEY (performed_by)
    REFERENCES auth.users(id)
    ON DELETE SET NULL
);

-- Enable RLS
DO $$ 
BEGIN
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE public.user_audit_log ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public access for user creation" ON public.users;
  DROP POLICY IF EXISTS "Allow users to read all users" ON public.users;
  DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
  DROP POLICY IF EXISTS "Allow admins to delete users" ON public.users;
  DROP POLICY IF EXISTS "Allow reading audit logs" ON public.user_audit_log;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create RLS Policies
CREATE POLICY "Allow public access for user creation"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to read all users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Allow users to update their own profile"
  ON public.users FOR UPDATE
  USING (
    auth.uid() = auth_id 
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role')::text = 'head'
    )
  );

CREATE POLICY "Allow admins to delete users"
  ON public.users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role')::text = 'head'
    )
  );

CREATE POLICY "Allow reading audit logs"
  ON public.user_audit_log FOR SELECT
  USING (true);

-- Drop existing functions and triggers
DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
  DROP FUNCTION IF EXISTS public.handle_user_changes() CASCADE;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create or replace functions with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    auth_id,
    email,
    name,
    role,
    department,
    position
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'normal'::user_role),
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'position'
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error and continue
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_changes()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_audit_log (
      user_id,
      action,
      changes,
      performed_by
    )
    VALUES (
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
    )
    VALUES (
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      auth.uid()
    );
  END IF;
  
  RETURN NULL;
EXCEPTION
  WHEN others THEN
    -- Log error and continue
    RAISE WARNING 'Error in handle_user_changes: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Create triggers with proper error handling
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating on_auth_user_created trigger: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS on_user_changes ON public.users;
  CREATE TRIGGER on_user_changes
    AFTER UPDATE OR DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_changes();
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating on_user_changes trigger: %', SQLERRM;
END $$;