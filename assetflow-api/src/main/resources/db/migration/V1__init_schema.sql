-- ============================================================
-- AssetFlow Database Migration V1: Core Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TYPE user_role AS ENUM ('ROLE_ADMIN', 'ROLE_EMPLOYEE');

CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    role                user_role NOT NULL DEFAULT 'ROLE_EMPLOYEE',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at       TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITH TIME ZONE
);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(500) NOT NULL UNIQUE,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_revoked  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_used     BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- DEPARTMENTS
-- ============================================================

CREATE TABLE departments (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    parent_id       BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    head_user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- EMPLOYEE PROFILES
-- ============================================================

CREATE TABLE employee_profiles (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    emp_code        VARCHAR(50) NOT NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    department_id   BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    designation     VARCHAR(255),
    joined_date     DATE,
    avatar_url      VARCHAR(500),
    is_dept_head    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- ASSET CATEGORIES
-- ============================================================

CREATE TABLE asset_categories (
    id                      BIGSERIAL PRIMARY KEY,
    uuid                    UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name                    VARCHAR(255) NOT NULL,
    code                    VARCHAR(50) NOT NULL UNIQUE,
    description             TEXT,
    parent_id               BIGINT REFERENCES asset_categories(id) ON DELETE SET NULL,
    depreciation_rate       DECIMAL(5,2),
    useful_life_years       INTEGER,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted              BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at              TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- ASSETS
-- ============================================================

CREATE TYPE asset_status AS ENUM (
    'AVAILABLE', 'ALLOCATED', 'RESERVED', 'MAINTENANCE',
    'LOST', 'RETIRED', 'DISPOSED'
);
CREATE TYPE asset_condition AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

CREATE TABLE assets (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    asset_tag           VARCHAR(100) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    category_id         BIGINT NOT NULL REFERENCES asset_categories(id),
    status              asset_status NOT NULL DEFAULT 'AVAILABLE',
    condition           asset_condition NOT NULL DEFAULT 'GOOD',
    location            VARCHAR(255),
    department_id       BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    serial_number       VARCHAR(255),
    model               VARCHAR(255),
    manufacturer        VARCHAR(255),
    vendor              VARCHAR(255),
    purchase_date       DATE,
    purchase_price      DECIMAL(15,2),
    current_value       DECIMAL(15,2),
    warranty_expiry     DATE,
    notes               TEXT,
    created_by_user_id  BIGINT REFERENCES users(id),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITH TIME ZONE
);

CREATE TABLE asset_images (
    id          BIGSERIAL PRIMARY KEY,
    asset_id    BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    filename    VARCHAR(255),
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_documents (
    id          BIGSERIAL PRIMARY KEY,
    asset_id    BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    doc_type    VARCHAR(100),
    url         VARCHAR(500) NOT NULL,
    filename    VARCHAR(255),
    size_bytes  BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_qr_codes (
    id              BIGSERIAL PRIMARY KEY,
    asset_id        BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE UNIQUE,
    qr_data         TEXT NOT NULL,
    qr_image_url    VARCHAR(500),
    generated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ASSET LIFECYCLE HISTORY
-- ============================================================

CREATE TABLE asset_status_history (
    id              BIGSERIAL PRIMARY KEY,
    asset_id        BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    from_status     asset_status,
    to_status       asset_status NOT NULL,
    reason          TEXT,
    changed_by_user_id BIGINT REFERENCES users(id),
    changed_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALLOCATIONS
-- ============================================================

CREATE TYPE allocation_status AS ENUM ('ACTIVE', 'RETURNED', 'TRANSFERRED', 'OVERDUE');

CREATE TABLE allocations (
    id                          BIGSERIAL PRIMARY KEY,
    uuid                        UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    asset_id                    BIGINT NOT NULL REFERENCES assets(id),
    allocated_to_user_id        BIGINT NOT NULL REFERENCES users(id),
    allocated_by_user_id        BIGINT NOT NULL REFERENCES users(id),
    department_id               BIGINT REFERENCES departments(id),
    status                      allocation_status NOT NULL DEFAULT 'ACTIVE',
    allocation_date             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expected_return_date        DATE,
    actual_return_date          TIMESTAMP WITH TIME ZONE,
    condition_at_allocation     asset_condition,
    condition_at_return         asset_condition,
    notes                       TEXT,
    return_notes                TEXT,
    returned_to_user_id         BIGINT REFERENCES users(id),
    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE allocation_photos (
    id              BIGSERIAL PRIMARY KEY,
    allocation_id   BIGINT NOT NULL REFERENCES allocations(id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL,
    photo_type      VARCHAR(20) NOT NULL CHECK (photo_type IN ('BEFORE', 'AFTER')),
    uploaded_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOOKABLE RESOURCES & BOOKINGS
-- ============================================================

CREATE TYPE resource_type AS ENUM ('MEETING_ROOM', 'PROJECTOR', 'VEHICLE', 'EQUIPMENT');
CREATE TYPE booking_status AS ENUM ('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE bookable_resources (
    id          BIGSERIAL PRIMARY KEY,
    uuid        UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name        VARCHAR(255) NOT NULL,
    type        resource_type NOT NULL,
    location    VARCHAR(255),
    capacity    INTEGER,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at  TIMESTAMP WITH TIME ZONE
);

CREATE TABLE bookings (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    resource_id         BIGINT NOT NULL REFERENCES bookable_resources(id),
    booked_by_user_id   BIGINT NOT NULL REFERENCES users(id),
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    start_datetime      TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime        TIMESTAMP WITH TIME ZONE NOT NULL,
    status              booking_status NOT NULL DEFAULT 'UPCOMING',
    notes               TEXT,
    reminder_sent       BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_reason    TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_booking_dates CHECK (end_datetime > start_datetime)
);

-- ============================================================
-- MAINTENANCE
-- ============================================================

CREATE TYPE maintenance_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE maintenance_status AS ENUM (
    'PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'
);

CREATE TABLE maintenance_requests (
    id                      BIGSERIAL PRIMARY KEY,
    uuid                    UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    asset_id                BIGINT NOT NULL REFERENCES assets(id),
    requested_by_user_id    BIGINT NOT NULL REFERENCES users(id),
    assigned_technician_id  BIGINT REFERENCES users(id),
    approved_by_user_id     BIGINT REFERENCES users(id),
    priority                maintenance_priority NOT NULL DEFAULT 'MEDIUM',
    status                  maintenance_status NOT NULL DEFAULT 'PENDING',
    title                   VARCHAR(255) NOT NULL,
    description             TEXT,
    resolution_notes        TEXT,
    scheduled_date          DATE,
    completed_date          TIMESTAMP WITH TIME ZONE,
    estimated_cost          DECIMAL(15,2),
    actual_cost             DECIMAL(15,2),
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT
-- ============================================================

CREATE TYPE audit_cycle_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE audit_item_status AS ENUM ('PENDING', 'VERIFIED', 'MISSING', 'DAMAGED');

CREATE TABLE audit_cycles (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    status              audit_cycle_status NOT NULL DEFAULT 'PLANNED',
    start_date          DATE NOT NULL,
    end_date            DATE,
    created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
    closed_by_user_id   BIGINT REFERENCES users(id),
    closed_at           TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_assignments (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    audit_cycle_id      BIGINT NOT NULL REFERENCES audit_cycles(id) ON DELETE CASCADE,
    auditor_user_id     BIGINT NOT NULL REFERENCES users(id),
    department_id       BIGINT REFERENCES departments(id),
    location            VARCHAR(255),
    notes               TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_items (
    id                      BIGSERIAL PRIMARY KEY,
    audit_assignment_id     BIGINT NOT NULL REFERENCES audit_assignments(id) ON DELETE CASCADE,
    asset_id                BIGINT NOT NULL REFERENCES assets(id),
    status                  audit_item_status NOT NULL DEFAULT 'PENDING',
    condition               asset_condition,
    notes                   TEXT,
    verified_by_user_id     BIGINT REFERENCES users(id),
    verified_at             TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TYPE notification_type AS ENUM (
    'ASSET_ALLOCATED', 'ASSET_RETURNED', 'MAINTENANCE_REQUESTED',
    'MAINTENANCE_RESOLVED', 'BOOKING_CONFIRMED', 'BOOKING_REMINDER',
    'BOOKING_CANCELLED', 'WARRANTY_EXPIRING', 'AUDIT_ASSIGNED',
    'APPROVAL_REQUIRED', 'APPROVAL_RESOLVED', 'OVERDUE_RETURN',
    'GENERAL'
);

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    type            notification_type NOT NULL DEFAULT 'GENERAL',
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    entity_type     VARCHAR(100),
    entity_id       BIGINT,
    read_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPROVAL REQUESTS
-- ============================================================

CREATE TYPE approval_type AS ENUM (
    'MAINTENANCE_REQUEST', 'ASSET_DISPOSAL', 'ASSET_TRANSFER',
    'ALLOCATION_REQUEST', 'AUDIT_CLOSE'
);
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE approval_requests (
    id                      BIGSERIAL PRIMARY KEY,
    uuid                    UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    type                    approval_type NOT NULL,
    entity_id               BIGINT NOT NULL,
    entity_type             VARCHAR(100) NOT NULL,
    requested_by_user_id    BIGINT NOT NULL REFERENCES users(id),
    approved_by_user_id     BIGINT REFERENCES users(id),
    status                  approval_status NOT NULL DEFAULT 'PENDING',
    title                   VARCHAR(255) NOT NULL,
    description             TEXT,
    notes                   TEXT,
    resolution_notes        TEXT,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at             TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- ACTIVITY LOGS (Audit Trail)
-- ============================================================

CREATE TABLE activity_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100),
    entity_id       BIGINT,
    description     TEXT,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      VARCHAR(50),
    user_agent      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Users
CREATE INDEX idx_users_email ON users(email) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_role ON users(role) WHERE is_deleted = FALSE;

-- Departments
CREATE INDEX idx_departments_parent ON departments(parent_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_departments_code ON departments(code);

-- Employee Profiles
CREATE INDEX idx_emp_user ON employee_profiles(user_id);
CREATE INDEX idx_emp_dept ON employee_profiles(department_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_emp_code ON employee_profiles(emp_code);

-- Assets
CREATE INDEX idx_assets_tag ON assets(asset_tag);
CREATE INDEX idx_assets_status ON assets(status) WHERE is_deleted = FALSE;
CREATE INDEX idx_assets_category ON assets(category_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_assets_department ON assets(department_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_assets_warranty ON assets(warranty_expiry) WHERE is_deleted = FALSE;
CREATE INDEX idx_assets_search ON assets USING gin(to_tsvector('english', name || ' ' || COALESCE(serial_number, '') || ' ' || COALESCE(asset_tag, '')));

-- Allocations
CREATE INDEX idx_alloc_asset ON allocations(asset_id);
CREATE INDEX idx_alloc_user ON allocations(allocated_to_user_id);
CREATE INDEX idx_alloc_status ON allocations(status);

-- Bookings
CREATE INDEX idx_bookings_resource ON bookings(resource_id);
CREATE INDEX idx_bookings_user ON bookings(booked_by_user_id);
CREATE INDEX idx_bookings_time ON bookings(start_datetime, end_datetime);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Maintenance
CREATE INDEX idx_maint_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maint_status ON maintenance_requests(status);
CREATE INDEX idx_maint_priority ON maintenance_requests(priority);

-- Notifications
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);
CREATE INDEX idx_notif_created ON notifications(created_at DESC);

-- Activity Logs
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- Audit
CREATE INDEX idx_audit_cycle_status ON audit_cycles(status);
CREATE INDEX idx_audit_item_status ON audit_items(status);
