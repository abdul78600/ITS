/*
  # Asset Management Schema with Fixed RLS Policies
  
  1. Changes
    - Drop existing tables
    - Create core tables
    - Enable RLS
    - Create policies using auth.uid() directly
  
  2. Tables
    - assets: Core asset information
    - asset_assignments: Track asset assignments
    - asset_history: Audit trail
    
  3. Security
    - RLS enabled on all tables
    - Simplified policies using auth.uid()
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS asset_history CASCADE;
DROP TABLE IF EXISTS asset_assignments CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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