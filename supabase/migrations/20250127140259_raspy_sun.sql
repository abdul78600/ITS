/*
  # User Management Schema

  1. Changes
    - Create users table with roles and permissions
    - Set up RLS policies for user management
    - Add audit logging for user changes
    
  2. Security
    - Enable RLS on all tables
    - Role-based access control
    - Department-based policies
*/

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('head', 'manager', 'normal', 'view');

-- Create user status enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'locked');

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid REFERENCES auth.users(id),
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
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create user audit log
CREATE TABLE user_audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  changes jsonb NOT NULL,
  performed_by uuid REFERENCES auth.users(id),
  performed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users can view their own profile and users in their department
CREATE POLICY "Users can view their own profile and department users"
  ON users FOR SELECT
  USING (
    auth.uid() = auth_id OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = department
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

-- Only heads and IT managers can create users
CREATE POLICY "Heads and IT managers can create users"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'head'
      OR (raw_user_meta_data->>'role' = 'manager' AND raw_user_meta_data->>'department' = 'IT')
    )
  );

-- Users can update their own profile, heads can update any user
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (
    auth.uid() = auth_id OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'head'
    )
  );

-- Only heads can delete users
CREATE POLICY "Only heads can delete users"
  ON users FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'head'
    )
  );

-- Audit log policies
CREATE POLICY "Users can view their own audit logs"
  ON user_audit_log FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    ) OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

-- Functions and Triggers

-- Update user's last login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_login = now()
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log user changes
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO user_audit_log (
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
    INSERT INTO user_audit_log (
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
$$ LANGUAGE plpgsql;

-- Create Triggers
CREATE TRIGGER update_user_last_login
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

CREATE TRIGGER log_user_changes
  AFTER UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_user_changes();