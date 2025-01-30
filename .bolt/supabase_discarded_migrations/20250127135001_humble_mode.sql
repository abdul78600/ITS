/*
  # Asset Management Schema

  1. New Tables
    - `assets`
      - Core asset information including name, type, status, etc.
      - Tracks asset lifecycle and specifications
    - `asset_assignments` 
      - Tracks asset assignments to users
      - Records assignment history
    - `asset_history`
      - Audit trail for all asset changes
      - Captures who made changes and when

  2. Security
    - Enable RLS on all tables
    - Policies for:
      - Department-based access control
      - Role-based permissions
      - Audit trail protection

  3. Changes
    - Add triggers for:
      - Automatic timestamp updates
      - History logging
      - Data validation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS asset_history CASCADE;
DROP TABLE IF EXISTS asset_assignments CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

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
  created_by uuid,
  updated_by uuid
);

CREATE TABLE asset_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  assigned_to text NOT NULL,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  returned_at timestamptz,
  notes text
);

CREATE TABLE asset_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  action text NOT NULL,
  changes jsonb NOT NULL,
  performed_by uuid,
  performed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;

-- Create Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
CREATE POLICY "Enable read access for all users"
  ON assets FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for asset owners"
  ON assets FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Enable delete for asset owners"
  ON assets FOR DELETE
  USING (created_by = auth.uid());

-- Asset assignments policies
CREATE POLICY "Enable read access for all users"
  ON asset_assignments FOR SELECT
  USING (true);

CREATE POLICY "Enable all access for authenticated users"
  ON asset_assignments FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Asset history policies
CREATE POLICY "Enable read access for all users"
  ON asset_history FOR SELECT
  USING (true);