-- ==============================================================================
-- HERITA: PostgreSQL + PostGIS + pgvector Production Schema
-- Smart India Hackathon (SIH 2026) | Living Cultural Heritage Preservation
-- ==============================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum Types
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE survival_status AS ENUM ('thriving', 'stable', 'vulnerable', 'at_risk', 'critical');
CREATE TYPE heritage_category AS ENUM ('music', 'literature', 'history', 'people', 'craft', 'game', 'food', 'tradition');
CREATE TYPE verification_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role DEFAULT 'user',
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cities Table
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    location GEOGRAPHY(Point, 4326) NOT NULL,
    cultural_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Heritage Items Table (Geospatial + Vector Embeddings)
CREATE TABLE heritage_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category heritage_category NOT NULL,
    short_description TEXT NOT NULL,
    detailed_history TEXT,
    why_it_matters TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326),
    origin_era VARCHAR(100),
    active_practitioners_summary VARCHAR(255),
    cultural_survival_score INTEGER CHECK (cultural_survival_score BETWEEN 0 AND 100),
    status survival_status DEFAULT 'stable',
    embedding vector(1536), -- For multimodal semantic similarity search
    audio_sample_url TEXT,
    thumbnail_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Traditions Deep-Dive Table
CREATE TABLE traditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    heritage_item_id UUID REFERENCES heritage_items(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    origin_region VARCHAR(150),
    current_practitioners_count INTEGER DEFAULT 0,
    median_practitioner_age INTEGER,
    active_learners_count INTEGER DEFAULT 0,
    last_documented_performance DATE,
    documentation_score NUMERIC(5,2),
    economic_sustainability_score NUMERIC(5,2),
    survival_score NUMERIC(5,2),
    survival_tier survival_status,
    master_lesson_steps JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Verified Cultural Guides Table
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    specializations TEXT[] NOT NULL,
    languages TEXT[] NOT NULL,
    hourly_rate NUMERIC(10,2) NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.0,
    total_tours INTEGER DEFAULT 0,
    is_verified_keeper BOOLEAN DEFAULT FALSE,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Preservation Submissions Table
CREATE TABLE preservation_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    tradition_name VARCHAR(200) NOT NULL,
    raw_description TEXT NOT NULL,
    estimated_practitioners INTEGER,
    location_details VARCHAR(255),
    media_urls TEXT[],
    ai_structured_data JSONB,
    ai_duplicate_similarity NUMERIC(5,4),
    ai_confidence_score NUMERIC(5,2),
    verification_status verification_status DEFAULT 'pending',
    assigned_moderator_id UUID REFERENCES users(id),
    moderator_notes TEXT,
    citation_sources TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. User Passport & Activity Ledger
CREATE TABLE user_passport_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'explored_place', 'learned_tradition', 'quiz_completed', 'preserved_item'
    reference_id UUID,
    points_awarded INTEGER NOT NULL,
    badge_awarded VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial & Vector Indexing for Fast Querying
CREATE INDEX idx_heritage_location ON heritage_items USING GIST(location);
CREATE INDEX idx_heritage_city ON heritage_items(city_id);
CREATE INDEX idx_heritage_category ON heritage_items(category);
CREATE INDEX idx_heritage_status ON heritage_items(status);
CREATE INDEX idx_submissions_status ON preservation_submissions(verification_status);
