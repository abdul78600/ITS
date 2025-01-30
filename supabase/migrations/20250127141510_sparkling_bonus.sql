-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_audit_log CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid UNIQUE,
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
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_auth_user
    FOREIGN KEY (auth_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL
);

-- Create user audit log
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
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Allow public access for user creation
CREATE POLICY "Allow public access for user creation"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Allow users to read all users
CREATE POLICY "Allow users to read all users"
  ON public.users FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = auth_id);

-- Allow admins to delete users
CREATE POLICY "Allow admins to delete users"
  ON public.users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role')::text = 'head'
    )
  );

-- Allow reading audit logs
CREATE POLICY "Allow reading audit logs"
  ON public.user_audit_log FOR SELECT
  USING (true);

-- Create Functions
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _role user_role;
  _retries integer := 0;
  _max_retries constant integer := 3;
  _delay constant integer := 1; -- seconds
BEGIN
  -- Get role with retry logic
  WHILE _retries < _max_retries LOOP
    BEGIN
      _role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'normal'::user_role);
      EXIT;
    EXCEPTION WHEN others THEN
      _retries := _retries + 1;
      IF _retries = _max_retries THEN
        RAISE WARNING 'Failed to get role after % retries', _max_retries;
        _role := 'normal'::user_role;
      ELSE
        PERFORM pg_sleep(_delay);
      END IF;
    END;
  END LOOP;

  -- Insert user with retry logic
  _retries := 0;
  WHILE _retries < _max_retries LOOP
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
        _role,
        NEW.raw_user_meta_data->>'department',
        NEW.raw_user_meta_data->>'position'
      )
      ON CONFLICT (auth_id) DO NOTHING;
      
      RETURN NEW;
    EXCEPTION WHEN others THEN
      _retries := _retries + 1;
      IF _retries = _max_retries THEN
        RAISE WARNING 'Failed to create user after % retries: %', _max_retries, SQLERRM;
        RETURN NEW;
      ELSE
        PERFORM pg_sleep(_delay);
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_changes()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _retries integer := 0;
  _max_retries constant integer := 3;
  _delay constant integer := 1; -- seconds
BEGIN
  WHILE _retries < _max_retries LOOP
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
    EXCEPTION WHEN others THEN
      _retries := _retries + 1;
      IF _retries = _max_retries THEN
        RAISE WARNING 'Failed to log user changes after % retries: %', _max_retries, SQLERRM;
        RETURN NULL;
      ELSE
        PERFORM pg_sleep(_delay);
      END IF;
    END;
  END LOOP;

  RETURN NULL;
END;
$$;

-- Create Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

DROP TRIGGER IF EXISTS on_user_changes ON public.users;
CREATE TRIGGER on_user_changes
  AFTER UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_changes();