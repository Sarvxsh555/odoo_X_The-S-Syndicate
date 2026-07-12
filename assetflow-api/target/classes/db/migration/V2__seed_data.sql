-- ============================================================
-- AssetFlow Migration V2: Seed Data
-- ============================================================

-- Default Admin User (password: Admin@123)
INSERT INTO users (email, password_hash, role, is_active, is_email_verified)
VALUES ('admin@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_ADMIN', TRUE, TRUE);

-- Admin Employee Profile
INSERT INTO employee_profiles (user_id, emp_code, first_name, last_name, designation, joined_date, is_dept_head)
VALUES (1, 'EMP-001', 'System', 'Administrator', 'IT Administrator', CURRENT_DATE, FALSE);

-- Default Asset Categories
INSERT INTO asset_categories (name, code, description, depreciation_rate, useful_life_years) VALUES
('IT Equipment', 'IT', 'Computers, laptops, servers, and peripherals', 25.00, 4),
('Office Furniture', 'FURN', 'Desks, chairs, cabinets, and office fixtures', 10.00, 10),
('Office Equipment', 'OFFQ', 'Printers, projectors, and office machinery', 20.00, 5),
('Vehicles', 'VEH', 'Company vehicles and transportation assets', 15.00, 7),
('Communication', 'COMM', 'Phones, radios, and communication devices', 25.00, 4),
('Medical Equipment', 'MED', 'Medical devices and healthcare equipment', 10.00, 10),
('Machinery', 'MACH', 'Industrial machines and heavy equipment', 10.00, 10),
('Software Licenses', 'SW', 'Software and digital licenses', 33.33, 3);

-- IT Sub-categories
INSERT INTO asset_categories (name, code, parent_id, description, depreciation_rate, useful_life_years) VALUES
('Laptops', 'IT-LAP', 1, 'Portable computing devices', 25.00, 4),
('Desktops', 'IT-DSK', 1, 'Desktop computers and workstations', 25.00, 4),
('Servers', 'IT-SRV', 1, 'Server hardware', 20.00, 5),
('Peripherals', 'IT-PER', 1, 'Keyboards, mice, monitors, and accessories', 25.00, 4),
('Network Equipment', 'IT-NET', 1, 'Routers, switches, and networking devices', 20.00, 5);

-- Office Furniture Sub-categories
INSERT INTO asset_categories (name, code, parent_id, description, depreciation_rate, useful_life_years) VALUES
('Chairs', 'FURN-CHR', 2, 'Office chairs and seating', 10.00, 10),
('Desks', 'FURN-DSK', 2, 'Office desks and workstations', 10.00, 10),
('Cabinets', 'FURN-CAB', 2, 'Filing and storage cabinets', 10.00, 10);

-- Default Departments
INSERT INTO departments (name, code, description, is_active) VALUES
('Executive', 'EXEC', 'Executive leadership and management', TRUE),
('Information Technology', 'IT', 'Technology and systems management', TRUE),
('Human Resources', 'HR', 'Human resources and people management', TRUE),
('Finance', 'FIN', 'Financial management and accounting', TRUE),
('Operations', 'OPS', 'Operational management and logistics', TRUE),
('Sales & Marketing', 'SM', 'Sales, marketing, and business development', TRUE),
('Research & Development', 'RD', 'Research, development, and innovation', TRUE),
('Facilities', 'FAC', 'Facilities management and maintenance', TRUE);

-- Default Bookable Resources
INSERT INTO bookable_resources (name, type, location, capacity, description) VALUES
('Conference Room A', 'MEETING_ROOM', 'Building 1, Floor 2', 20, 'Main conference room with projector and whiteboard'),
('Conference Room B', 'MEETING_ROOM', 'Building 1, Floor 3', 10, 'Small meeting room with TV screen'),
('Board Room', 'MEETING_ROOM', 'Building 1, Floor 5', 30, 'Executive board room with full AV setup'),
('Epson Projector 1', 'PROJECTOR', 'IT Storage', NULL, 'Full HD portable projector'),
('Epson Projector 2', 'PROJECTOR', 'IT Storage', NULL, 'HD portable projector'),
('Company Car - Toyota', 'VEHICLE', 'Parking Level B1', NULL, 'Toyota Camry - Silver (KA-01-AB-1234)'),
('Company Van - Ford', 'VEHICLE', 'Parking Level B1', NULL, 'Ford Transit - White (KA-02-CD-5678)'),
('Camera Kit - Canon', 'EQUIPMENT', 'Marketing Storage', NULL, 'Canon EOS camera with tripod and accessories');
