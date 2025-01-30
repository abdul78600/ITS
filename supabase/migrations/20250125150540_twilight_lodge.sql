/*
  # Asset Management System Schema

  1. Tables
    - assets: Main asset information
    - asset_assignments: Track asset assignments
    - asset_history: Track changes to assets

  2. Functions
    - update_updated_at: Automatically update timestamps
    - log_asset_changes: Track asset modifications

  3. Security
    - Row Level Security (RLS) enabled on all tables
    - Department-based access control
    - Role-based permissions
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects if they exist
DROP TABLE IF EXISTS asset_history CASCADE;
DROP TABLE IF EXISTS asset_assignments CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS log_asset_changes() CASCADE;

-- Create Tables
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  serial_number text UNIQUE NOT NULL,
  vendor text,
  status text NOT NULL DEFAULT 'active',
  condition text NOT NULL DEFAULT 'new',
  purchase_date date,
  warranty_expiry date,
  location text NOT NULL,
  department text NOT NULL,
  specifications jsonb DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE asset_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  assigned_to text NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  returned_at timestamptz,
  notes text
);

CREATE TABLE asset_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  action text NOT NULL,
  changes jsonb NOT NULL,
  performed_by uuid REFERENCES auth.users(id),
  performed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;

-- Create Functions
CREATE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION log_asset_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO asset_history (
      asset_id,
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
      NEW.updated_by
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO asset_history (
      asset_id,
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
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER log_asset_changes_trigger
  AFTER UPDATE OR DELETE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION log_asset_changes();

-- Create RLS Policies
CREATE POLICY "Users can view assets in their department"
  ON assets FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = department
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

CREATE POLICY "IT and managers can create assets"
  ON assets FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = 'IT'
      OR raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

CREATE POLICY "IT and managers can update assets"
  ON assets FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = 'IT'
      OR raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

CREATE POLICY "Only IT head can delete assets"
  ON assets FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'head'
      AND raw_user_meta_data->>'department' = 'IT'
    )
  );

CREATE POLICY "Users can view their assignments"
  ON asset_assignments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = (
        SELECT department FROM assets WHERE id = asset_id
      )
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

CREATE POLICY "IT and managers can manage assignments"
  ON asset_assignments FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = 'IT'
      OR raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

CREATE POLICY "Users can view asset history"
  ON asset_history FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = (
        SELECT department FROM assets WHERE id = asset_id
      )
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );