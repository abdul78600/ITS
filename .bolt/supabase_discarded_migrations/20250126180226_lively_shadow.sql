/*
  # Create Software Management Tables

  1. New Tables
    - `software`
      - `id` (uuid, primary key)
      - `name` (text)
      - `vendor` (text)
      - `version` (text)
      - `type` (text)
      - `license_key` (text)
      - `purchase_date` (date)
      - `expiry_date` (date)
      - `status` (text)
      - `department` (text)
      - `cost` (numeric)
      - `seats` (integer)
      - `used_seats` (integer)
      - `category` (text)
      - `platform` (text)
      - `installation_path` (text)
      - `support_contact` (text)
      - `notes` (text)
      - `compliance` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid)
      - `updated_by` (uuid)

  2. Security
    - Enable RLS on `software` table
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create software table
CREATE TABLE IF NOT EXISTS software (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  vendor text NOT NULL,
  version text NOT NULL,
  type text NOT NULL,
  license_key text,
  purchase_date date,
  expiry_date date,
  status text NOT NULL DEFAULT 'active',
  department text NOT NULL,
  cost numeric DEFAULT 0,
  seats integer NOT NULL DEFAULT 1,
  used_seats integer DEFAULT 0,
  category text NOT NULL,
  platform text,
  installation_path text,
  support_contact text,
  notes text,
  compliance text DEFAULT 'compliant',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE software ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view software in their department"
  ON software FOR SELECT
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

CREATE POLICY "IT and managers can create software"
  ON software FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = 'IT'
      OR raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

CREATE POLICY "IT and managers can update software"
  ON software FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'department' = 'IT'
      OR raw_user_meta_data->>'role' IN ('head', 'manager')
    )
  );

CREATE POLICY "Only IT head can delete software"
  ON software FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'head'
      AND raw_user_meta_data->>'department' = 'IT'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_software_updated_at
  BEFORE UPDATE ON software
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();