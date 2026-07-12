-- ============================================================
-- AssetFlow Database Migration V1: Core Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(50) NOT NULL DEFAULT 'ROLE_EMPLOYEE',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at       TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_users_role CHECK (role IN ('ROLE_ADMIN', 'ROLE_EMPLOYEE'))
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

CREATE TABLE assets (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    asset_tag           VARCHAR(100) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    category_id         BIGINT NOT NULL REFERENCES asset_categories(id),
    status              VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    condition           VARCHAR(50) NOT NULL DEFAULT 'GOOD',
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
    deleted_at          TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_assets_status CHECK (status IN ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED')),
    CONSTRAINT chk_assets_condition CHECK (condition IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'))
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
    from_status     VARCHAR(50),
    to_status       VARCHAR(50) NOT NULL,
    reason          TEXT,
    changed_by_user_id BIGINT REFERENCES users(id),
    changed_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_asset_status_history_from_status CHECK (from_status IS NULL OR from_status IN ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED')),
    CONSTRAINT chk_asset_status_history_to_status CHECK (to_status IN ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'))
);

-- ============================================================
-- ALLOCATIONS
-- ============================================================

CREATE TABLE allocations (
    id                          BIGSERIAL PRIMARY KEY,
    uuid                        UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    asset_id                    BIGINT NOT NULL REFERENCES assets(id),
    allocated_to_user_id        BIGINT NOT NULL REFERENCES users(id),
    allocated_by_user_id        BIGINT NOT NULL REFERENCES users(id),
    department_id               BIGINT REFERENCES departments(id),
    status                      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    allocation_date             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expected_return_date        DATE,
    actual_return_date          TIMESTAMP WITH TIME ZONE,
    condition_at_allocation     VARCHAR(50),
    condition_at_return         VARCHAR(50),
    notes                       TEXT,
    return_notes                TEXT,
    returned_to_user_id         BIGINT REFERENCES users(id),
    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_allocations_status CHECK (status IN ('ACTIVE', 'RETURNED', 'TRANSFERRED', 'OVERDUE')),
    CONSTRAINT chk_allocations_condition_at_allocation CHECK (condition_at_allocation IS NULL OR condition_at_allocation IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED')),
    CONSTRAINT chk_allocations_condition_at_return CHECK (condition_at_return IS NULL OR condition_at_return IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'))
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

CREATE TABLE bookable_resources (
    id          BIGSERIAL PRIMARY KEY,
    uuid        UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(50) NOT NULL,
    location    VARCHAR(255),
    capacity    INTEGER,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at  TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_bookable_resources_type CHECK (type IN ('MEETING_ROOM', 'PROJECTOR', 'VEHICLE', 'EQUIPMENT'))
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
    status              VARCHAR(50) NOT NULL DEFAULT 'UPCOMING',
    notes               TEXT,
    reminder_sent       BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_reason    TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_booking_dates CHECK (end_datetime > start_datetime),
    CONSTRAINT chk_bookings_status CHECK (status IN ('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

-- ============================================================
-- MAINTENANCE
-- ============================================================

CREATE TABLE maintenance_requests (
    id                      BIGSERIAL PRIMARY KEY,
    uuid                    UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    asset_id                BIGINT NOT NULL REFERENCES assets(id),
    requested_by_user_id    BIGINT NOT NULL REFERENCES users(id),
    assigned_technician_id  BIGINT REFERENCES users(id),
    approved_by_user_id     BIGINT REFERENCES users(id),
    priority                VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status                  VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    title                   VARCHAR(255) NOT NULL,
    description             TEXT,
    resolution_notes        TEXT,
    scheduled_date          DATE,
    completed_date          TIMESTAMP WITH TIME ZONE,
    estimated_cost          DECIMAL(15,2),
    actual_cost             DECIMAL(15,2),
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_maintenance_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_maintenance_status CHECK (status IN ('PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'))
);

-- ============================================================
-- AUDIT
-- ============================================================

CREATE TABLE audit_cycles (
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    status              VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    start_date          DATE NOT NULL,
    end_date            DATE,
    created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
    closed_by_user_id   BIGINT REFERENCES users(id),
    closed_at           TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_audit_cycles_status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
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
    status                  VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    condition               VARCHAR(50),
    notes                   TEXT,
    verified_by_user_id     BIGINT REFERENCES users(id),
    verified_at             TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_audit_items_status CHECK (status IN ('PENDING', 'VERIFIED', 'MISSING', 'DAMAGED')),
    CONSTRAINT chk_audit_items_condition CHECK (condition IS NULL OR condition IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'))
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    entity_type     VARCHAR(100),
    entity_id       BIGINT,
    read_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notifications_type CHECK (type IN ('ASSET_ALLOCATED', 'ASSET_RETURNED', 'MAINTENANCE_REQUESTED', 'MAINTENANCE_RESOLVED', 'BOOKING_CONFIRMED', 'BOOKING_REMINDER', 'BOOKING_CANCELLED', 'WARRANTY_EXPIRING', 'AUDIT_ASSIGNED', 'APPROVAL_REQUIRED', 'APPROVAL_RESOLVED', 'OVERDUE_RETURN', 'GENERAL'))
);

-- ============================================================
-- APPROVAL REQUESTS
-- ============================================================

CREATE TABLE approval_requests (
    id                      BIGSERIAL PRIMARY KEY,
    uuid                    UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    type                    VARCHAR(50) NOT NULL,
    entity_id               BIGINT NOT NULL,
    entity_type             VARCHAR(100) NOT NULL,
    requested_by_user_id    BIGINT NOT NULL REFERENCES users(id),
    approved_by_user_id     BIGINT REFERENCES users(id),
    status                  VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    title                   VARCHAR(255) NOT NULL,
    description             TEXT,
    notes                   TEXT,
    resolution_notes        TEXT,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at             TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_approval_type CHECK (type IN ('MAINTENANCE_REQUEST', 'ASSET_DISPOSAL', 'ASSET_TRANSFER', 'ALLOCATION_REQUEST', 'AUDIT_CLOSE')),
    CONSTRAINT chk_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
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
CREATE UNIQUE INDEX uq_alloc_active_asset ON allocations(asset_id) WHERE status = 'ACTIVE';
CREATE INDEX idx_alloc_expected_return ON allocations(expected_return_date) WHERE status = 'ACTIVE';

-- Bookings
CREATE INDEX idx_bookings_resource ON bookings(resource_id);
CREATE INDEX idx_bookings_user ON bookings(booked_by_user_id);
CREATE INDEX idx_bookings_time ON bookings(start_datetime, end_datetime);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_resource_time_active ON bookings(resource_id, start_datetime, end_datetime) WHERE status <> 'CANCELLED';

-- Maintenance
CREATE INDEX idx_maint_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maint_requested_by ON maintenance_requests(requested_by_user_id);
CREATE INDEX idx_maint_assigned_technician ON maintenance_requests(assigned_technician_id);
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
CREATE INDEX idx_audit_assignment_cycle ON audit_assignments(audit_cycle_id);
CREATE INDEX idx_audit_assignment_auditor ON audit_assignments(auditor_user_id);
CREATE INDEX idx_audit_item_assignment ON audit_items(audit_assignment_id);
CREATE INDEX idx_audit_item_asset ON audit_items(asset_id);
CREATE INDEX idx_audit_item_status ON audit_items(status);
