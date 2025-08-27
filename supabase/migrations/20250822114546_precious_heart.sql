/*
  # Project Aura Database Schema
  
  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - Unique user identifier
      - `name` (text) - User's name for emergency alerts  
      - `created_at` (timestamp) - Account creation time
      - `updated_at` (timestamp) - Last profile update
    
    - `emergency_contacts` 
      - `id` (uuid, primary key) - Contact identifier
      - `user_id` (uuid, foreign key) - Reference to user
      - `name` (text) - Contact's name
      - `phone_number` (text) - Contact's phone number
      - `created_at` (timestamp) - Contact creation time
    
    - `emergency_alerts`
      - `id` (uuid, primary key) - Alert identifier  
      - `user_id` (uuid, foreign key) - Reference to user
      - `latitude` (numeric) - Location latitude
      - `longitude` (numeric) - Location longitude
      - `message` (text) - Alert message sent
      - `contacts_notified` (integer) - Number of contacts reached
      - `alert_data` (jsonb) - Detailed alert results
      - `created_at` (timestamp) - Alert timestamp
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Emergency contacts can only be managed by the user who owns them
    - Alert history is private to each user
  
  3. Indexes
    - Create indexes for efficient querying by user_id
    - Add index on emergency_alerts timestamp for analytics
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency_contacts table  
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create emergency_alerts table for logging
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  latitude numeric,
  longitude numeric, 
  message text NOT NULL,
  contacts_notified integer DEFAULT 0,
  alert_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile"  
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON user_profiles  
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view own contacts"
  ON emergency_contacts
  FOR SELECT  
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own contacts"
  ON emergency_contacts
  FOR INSERT
  TO authenticated  
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own contacts" 
  ON emergency_contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own contacts"
  ON emergency_contacts  
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for emergency_alerts  
CREATE POLICY "Users can view own alerts"
  ON emergency_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Service role can insert alerts (for the edge function)
CREATE POLICY "Service role can insert alerts"
  ON emergency_alerts
  FOR INSERT
  TO service_role  
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON emergency_alerts(created_at);

-- Add updated_at trigger for user_profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;  
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();