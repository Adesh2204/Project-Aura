-- Enable UUID extension (needed for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for USERS
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);


-- =========================
-- SOS ALERTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for SOS Alerts
CREATE POLICY "Users can view own SOS alerts"
ON public.sos_alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own SOS alerts"
ON public.sos_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SOS alerts"
ON public.sos_alerts
FOR UPDATE
USING (auth.uid() = user_id);


-- =========================
-- EMERGENCY CONTACTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for Emergency Contacts
CREATE POLICY "Users can view own emergency contacts"
ON public.emergency_contacts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own emergency contacts"
ON public.emergency_contacts
FOR ALL
USING (auth.uid() = user_id);
