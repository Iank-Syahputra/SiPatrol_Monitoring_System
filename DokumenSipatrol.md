Project Specification Documentation: SiPatrol
(Security Monitoring System)
Case Study: PLN Nusantara Power UP Kendari
Document Version: 1.1 (Updated)
1. Project View (General Overview)
Background
This project aims to digitize the security reporting process in vital operational environments that have many scattered units (±15 Units). The old manual system has weaknesses in time accuracy, location validation, and information delays due to blank spot areas (signal difficulty).
Operational Flow Narrative
This application is web-based (Web App/PWA) which connects field officers (Security) with the control center (Admin).
1. Security Side (Reporter):
Security logs in using a personal account.
When patrolling, Security opens the "Create Report" feature.
The application automatically locks the location (GPS) and current time.
Security takes a photo of field conditions in real-time (gallery upload feature is disabled to prevent manipulation).
Key Feature: If located in an area without signal, the report is saved in the device memory (Offline Mode). The report will be automatically synchronized/uploaded when the device regains an internet signal.
2. Admin Side (Supervisor):
Admin monitors via the Central Dashboard.
The main view is the "Live Feed" which displays the 5 latest reports in real-time from various units.
Admin has full authority to manage master data (Units and Users) as well as perform audits by filtering reports based on specific Units.
2. Core Features (Main Features)
A. Security Module (User)
Secure Authentication: Session-based login that stores the reporter's identity and assignment unit.
Real-Time Evidence Capture: Direct camera access via browser with gallery access restriction (Anti-Fraud).
Automatic Geo-Tagging: Maps API integration to capture Latitude/Longitude coordinates when the photo is taken.
Offline Capability (Store-and-Forward): Ability to save text and photo data locally (Local Storage/IndexedDB) when offline, and a subsequent upload mechanism.
Personal Report History: Security can view the status of reports they have ever sent (Pending/Verified).
B. Admin Module (Center)
Dashboard Live Feed: Monitoring of the 5 latest reports coming in chronologically.
Unit Master Management: CRUD Features (Create, Read, Update, Delete) to add new units if operations expand.
Security User Management: Integration of Clerk account creation and Supabase profiles to arrange security placement.
Advanced Filtering: Report table that can be filtered based on Unit Name, Date Range, and Personnel Name.
3. Technical Specification (Technical Specs)
The application is built using "The Modern Web Stack" which prioritizes performance, development speed, and data security.
Component
Technology
Description
Frontend Framework
Next.js 14 (App Router)
React Framework for high performance and flexible routing.
UI Components
shadcn/ui + Tailwind CSS
Interface components that are modern, clean, and responsive (Mobile First).
Authentication
Clerk
Handles user management, sessions, and route protection (Middleware).
Backend & Database
Supabase
PostgreSQL Database, Realtime subscriptions, and Object Storage (Photos).
Offline Logic
Serwist (PWA) + Dexie.js
Handles application caching and browser local database.
Maps
Leaflet / Google Maps API
Patrol location visualization.

Auth Integration Structure
User logs in via Clerk. Clerk generates a special JWT token which is sent to Supabase. Supabase validates the token to provide data access according to Row Level Security (RLS).
4. Database Schema & Security
Database design uses PostgreSQL on Supabase with row-level security (RLS) implementation.
-- ================
-- 1. CLEAN-UP (OPTIONAL - Beware data loss)
-- =================
-- Remove comment below if you want to reset database from scratch

DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS units;
DROP TYPE IF EXISTS app_role;

-- 2. DATA TYPE SETUP (ENUM)
-- =====
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'security');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===============
-- 3. TABLE CREATION (MANDATORY ORDER)

-- A. Units Table (Parent 1: Has no FK)
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Profiles Table (Parent 2: Has FK to Units)
-- ID is Text because it takes string from Clerk
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role app_role DEFAULT 'security',
    assigned_unit_id UUID REFERENCES units (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Reports Table (Child: Has FK to Profiles & Units)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    image_path TEXT,
    notes TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    captured_at TIMESTAMPTZ NOT NULL,
    is_offline_submission BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE RLS (ACTIVATE SECURITY)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 5. CREATE POLICY (GROUND RULES)
-- =============================================

-- POLICY FOR UNITS
-- Delete old policy if exists to avoid duplicate error
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON units;

CREATE POLICY "Enable read access for authenticated users" ON units
FOR SELECT USING (
    auth.role() = 'authenticated'
);

-- --- POLICY FOR PROFILES ---
DROP POLICY IF EXISTS "User can see own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can see all profiles" ON profiles;

CREATE POLICY "User can see own profile" ON profiles
FOR SELECT USING (
    (auth.jwt() ->> 'sub') = id
);

CREATE POLICY "Admin can see all profiles" ON profiles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = (auth.jwt() ->> 'sub')
        AND role = 'admin'
    )
);

-- POLICY FOR REPORTS
DROP POLICY IF EXISTS "Security can insert own reports" ON reports;
DROP POLICY IF EXISTS "Security can view own reports" ON reports;
DROP POLICY IF EXISTS "Admin can view all reports" ON reports;

-- Security: Insert (Must use own ID)
CREATE POLICY "Security can insert own reports" ON reports
FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'sub') = user_id
);

-- Security: View own
CREATE POLICY "Security can view own reports" ON reports
FOR SELECT USING (
    (auth.jwt() ->> 'sub') = user_id
);

-- Admin: View all
CREATE POLICY "Admin can view all reports" ON reports
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = (auth.jwt() ->> 'sub')
        AND role = 'admin'
    )
);
