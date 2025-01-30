/*
  # Asset Management Schema

  1. New Tables
    - `assets`: Main assets table
    - `asset_assignments`: Track asset assignments
    - `asset_history`: Track changes to assets

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for department-based access

  3. Functions
    - Add trigger for updating timestamps
    - Add trigger for logging asset changes
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
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

-- Asset Assignments Table
CREATE TABLE IF NOT EXISTS asset_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  assigned_to text NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  returned_at timestamptz,
  notes text
);

-- Asset History Table
CREATE TABLE IF NOT EXISTS asset_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  action text NOT NULL,
  changes jsonb NOT NULL,
  performed_by uuid REFERENCES auth.users(id),
  performed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;

-- Create or replace updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger for updated_at
DO $$
BEGIN
  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
  
  -- Create the trigger
  CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
END $$;

-- Create or replace asset history trigger function
CREATE OR REPLACE FUNCTION log_asset_changes()
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

-- Drop and recreate asset history trigger
DO $$
BEGIN
  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS log_asset_changes_trigger ON assets;
  
  -- Create the trigger
  CREATE TRIGGER log_asset_changes_trigger
    AFTER UPDATE OR DELETE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION log_asset_changes();
END $$;

-- Drop existing policies
DO $$
BEGIN
  -- Assets policies
  DROP POLICY IF EXISTS "Users can view assets in their department" ON assets;
  DROP POLICY IF EXISTS "IT and managers can create assets" ON assets;
  DROP POLICY IF EXISTS "IT and managers can update assets" ON assets;
  DROP POLICY IF EXISTS "Only IT head can delete assets" ON assets;
  
  -- Asset assignments policies
  DROP POLICY IF EXISTS "Users can view assignments in their department" ON asset_assignments;
  DROP POLICY IF EXISTS "IT and managers can manage assignments" ON asset_assignments;
  
  -- Asset history policies
  DROP POLICY IF EXISTS "Users can view history in their department" ON asset_history;
END $$;

-- Create RLS Policies for assets
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

-- Create RLS Policies for asset assignments
CREATE POLICY "Users can view assignments in their department"
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

-- Create RLS Policies for asset history
CREATE POLICY "Users can view history in their department"
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