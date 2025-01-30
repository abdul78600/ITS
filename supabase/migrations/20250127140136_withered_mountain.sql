/*
  # IT Management System Schema Reset

  1. Changes
    - Drop existing tables if they exist
    - Recreate all tables with proper structure
    - Set up RLS policies
    - Add triggers for timestamps
    
  2. Security
    - Enable RLS on all tables
    - Add department-based policies
    - Add role-based policies
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS vendor_contacts CASCADE;
DROP TABLE IF EXISTS vendor_contracts CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS request_approvals CASCADE;
DROP TABLE IF EXISTS procurement_requests CASCADE;
DROP TABLE IF EXISTS asset_maintenance CASCADE;
DROP TABLE IF EXISTS asset_assignments CASCADE;
DROP TABLE IF EXISTS asset_history CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Tables
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  serial_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  condition text NOT NULL DEFAULT 'new',
  location text NOT NULL,
  department text NOT NULL,
  purchase_date date,
  warranty_expiry date,
  cost decimal(12,2),
  vendor text,
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

CREATE TABLE asset_maintenance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  type text NOT NULL,
  description text NOT NULL,
  cost decimal(12,2),
  performed_by text NOT NULL,
  performed_at timestamptz NOT NULL,
  next_maintenance timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE procurement_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending_approval',
  department text NOT NULL,
  required_by date,
  budget decimal(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'PKR',
  quantity integer NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'pieces',
  specifications text,
  justification text,
  vendor_preference text,
  current_approval_level integer NOT NULL DEFAULT 1,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE request_approvals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid REFERENCES procurement_requests(id) ON DELETE CASCADE,
  level integer NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE vendors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  performance_rating decimal(3,2),
  response_time integer,
  total_spend decimal(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE vendor_contracts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  value decimal(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  renewal_reminder boolean DEFAULT false,
  documents jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE vendor_contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  email text,
  phone text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Assets Policies
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

-- Procurement Policies
CREATE POLICY "Users can view their department's requests"
  ON procurement_requests FOR SELECT
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

CREATE POLICY "Users can create requests"
  ON procurement_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their requests"
  ON procurement_requests FOR UPDATE
  USING (created_by = auth.uid() OR auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' IN ('head', 'manager')
  ));

-- Vendor Policies
CREATE POLICY "Users can view vendors"
  ON vendors FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "IT and managers can manage vendors"
  ON vendors FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = 'IT'
      OR raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

-- Functions

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Triggers
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_procurement_requests_updated_at
  BEFORE UPDATE ON procurement_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vendor_contracts_updated_at
  BEFORE UPDATE ON vendor_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();