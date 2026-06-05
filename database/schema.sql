-- AURA EXPRESS AFRICA LTD - Database Schema
-- Run this in Supabase SQL Editor

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Contact details
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  
  -- Cargo details
  origin_country VARCHAR(100) NOT NULL,
  cargo_type VARCHAR(100) NOT NULL,
  transport_mode VARCHAR(100) NOT NULL,
  cargo_quantity INTEGER,
  cargo_dimensions VARCHAR(100),
  cargo_weight DECIMAL(10, 2),
  
  -- Route details
  route VARCHAR(255),
  route_details TEXT,
  delivery_country VARCHAR(100),
  final_destination VARCHAR(255),
  
  -- Additional
  message TEXT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  
  status VARCHAR(50) DEFAULT 'unread',
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_created_at ON contact_messages(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
