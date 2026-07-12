-- ============================================================
-- AssetFlow Migration V2: Seed Data (Odoo Corporate Preset)
-- ============================================================

-- 1. SEED DEPARTMENTS
INSERT INTO departments (id, name, code, description, is_active) VALUES
(1, 'Administration', 'ADMIN', 'Executive leadership and general administration', TRUE),
(2, 'Engineering', 'ENG', 'Product engineering and software development', TRUE),
(3, 'Product Management', 'PROD', 'Product strategy, roadmap, and design', TRUE),
(4, 'Quality Assurance', 'QA', 'Quality assurance and software testing', TRUE),
(5, 'IT Infrastructure', 'IT', 'Internal IT support, networks, and systems', TRUE),
(6, 'Human Resources', 'HR', 'Human resources, talent acquisition, and culture', TRUE),
(7, 'Finance', 'FIN', 'Financial management, payroll, and accounting', TRUE),
(8, 'Sales', 'SALES', 'Business development and sales operations', TRUE),
(9, 'Marketing', 'MKTG', 'Brand marketing, events, and lead generation', TRUE),
(10, 'Customer Success', 'CS', 'Client onboarding, support, and relationship management', TRUE),
(11, 'Legal', 'LEGAL', 'Contracts, compliance, and legal counsel', TRUE),
(12, 'Research & Innovation', 'RND', 'Experimental R&D projects and future tech', TRUE);

ALTER SEQUENCE departments_id_seq RESTART WITH 13;

-- 2. SEED USERS & EMPLOYEE PROFILES
-- Password hash for 'Admin@123' / 'Employee@123' (all seeded accounts will use: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq')
-- Users
INSERT INTO users (id, email, password_hash, role, is_active, is_email_verified) VALUES
(1, 'admin@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_ADMIN', TRUE, TRUE);

INSERT INTO users (id, email, password_hash, role, is_active, is_email_verified) VALUES
(2, 'priya.sharma@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_ADMIN', TRUE, TRUE), -- Asset Manager
(3, 'sneha.iyer@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE), -- HR Head
(4, 'arjun.kumar@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(5, 'rahul.menon@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(6, 'akash.verma@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(7, 'neha.gupta@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(8, 'karthik.raj@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(9, 'divya.nair@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(10, 'vivek.reddy@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(11, 'ananya.rao@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(12, 'vikram.singh@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(13, 'rohit.deshmukh@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(14, 'kavita.patel@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(15, 'siddharth.shah@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(16, 'meera.pillai@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(17, 'abhishek.pandey@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(18, 'shreya.sen@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(19, 'manish.joshi@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(20, 'aditi.bose@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(21, 'suresh.menon@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(22, 'harish.krishnan@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(23, 'ranjana.nair@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(24, 'tushar.saxena@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(25, 'rashmi.mishra@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(26, 'vijay.sharma@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(27, 'sunita.williams@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(28, 'nithin.kamath@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(29, 'kunal.shah@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE),
(30, 'radhika.apte@assetflow.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFf0RL/4.i97qFq', 'ROLE_EMPLOYEE', TRUE, TRUE);

-- Auto-reset Sequence for users
ALTER SEQUENCE users_id_seq RESTART WITH 31;

-- Employee Profiles
INSERT INTO employee_profiles (user_id, emp_code, first_name, last_name, phone, department_id, designation, joined_date, is_dept_head) VALUES
(1, 'EMP-001', 'System', 'Administrator', '9900112233', 1, 'IT Administrator', '2023-01-15', FALSE),
(2, 'EMP-002', 'Priya', 'Sharma', '9900112234', 2, 'Asset Manager', '2023-03-10', FALSE),
(3, 'EMP-003', 'Sneha', 'Iyer', '9900112235', 6, 'HR Director', '2022-05-20', TRUE),
(4, 'EMP-004', 'Arjun', 'Kumar', '9900112236', 2, 'Principal Engineer', '2021-08-11', FALSE),
(5, 'EMP-005', 'Rahul', 'Menon', '9900112237', 4, 'Senior QA Lead', '2022-10-01', FALSE),
(6, 'EMP-006', 'Akash', 'Verma', '9900112238', 3, 'Senior Product Manager', '2023-02-14', FALSE),
(7, 'EMP-007', 'Neha', 'Gupta', '9900112239', 8, 'VP of Global Sales', '2021-12-05', TRUE),
(8, 'EMP-008', 'Karthik', 'Raj', '9900112240', 5, 'Network Architect', '2022-02-28', FALSE),
(9, 'EMP-009', 'Divya', 'Nair', '9900112241', 7, 'Chief Finance Controller', '2021-06-15', TRUE),
(10, 'EMP-010', 'Vivek', 'Reddy', '9900112242', 9, 'Senior Marketing Manager', '2023-05-18', FALSE),
(11, 'EMP-011', 'Ananya', 'Rao', '9900112243', 2, 'Frontend Developer', '2023-09-01', FALSE),
(12, 'EMP-012', 'Vikram', 'Singh', '9900112244', 2, 'Backend Architect', '2022-01-20', TRUE),
(13, 'EMP-013', 'Rohit', 'Deshmukh', '9900112245', 2, 'DevOps Engineer', '2023-04-10', FALSE),
(14, 'EMP-014', 'Kavita', 'Patel', '9900112246', 4, 'QA Automation Engineer', '2023-07-22', FALSE),
(15, 'EMP-015', 'Siddharth', 'Shah', '9900112247', 3, 'Product Designer', '2023-11-02', FALSE),
(16, 'EMP-016', 'Meera', 'Pillai', '9900112248', 6, 'HR Operations Specialist', '2024-01-10', FALSE),
(17, 'EMP-017', 'Abhishek', 'Pandey', '9900112249', 7, 'Senior Financial Analyst', '2023-03-25', FALSE),
(18, 'EMP-018', 'Shreya', 'Sen', '9900112250', 8, 'Account Executive', '2023-08-14', FALSE),
(19, 'EMP-019', 'Manish', 'Joshi', '9900112251', 9, 'Content Strategist', '2023-10-05', FALSE),
(20, 'EMP-020', 'Aditi', 'Bose', '9900112252', 10, 'Customer Success Specialist', '2024-02-01', FALSE),
(21, 'EMP-021', 'Suresh', 'Menon', '9900112253', 10, 'Customer Support Lead', '2022-09-15', TRUE),
(22, 'EMP-022', 'Harish', 'Krishnan', '9900112254', 11, 'General Counsel', '2021-04-12', TRUE),
(23, 'EMP-023', 'Ranjana', 'Nair', '9900112255', 12, 'Research Scientist', '2022-11-01', FALSE),
(24, 'EMP-024', 'Tushar', 'Saxena', '9900112256', 12, 'Innovation Architect', '2022-07-15', TRUE),
(25, 'EMP-025', 'Rashmi', 'Mishra', '9900112257', 6, 'Talent Acquisition Partner', '2023-06-01', FALSE),
(26, 'EMP-026', 'Vijay', 'Sharma', '9900112258', 5, 'Desktop Support Specialist', '2023-05-12', FALSE),
(27, 'EMP-027', 'Sunita', 'Williams', '9900112259', 5, 'Systems Engineer', '2022-08-25', TRUE),
(28, 'EMP-028', 'Nithin', 'Kamath', '9900112260', 8, 'Sales Operations Manager', '2023-03-01', FALSE),
(29, 'EMP-029', 'Kunal', 'Shah', '9900112261', 9, 'Growth Marketing Lead', '2023-01-20', TRUE),
(30, 'EMP-030', 'Radhika', 'Apte', '9900112262', 10, 'Enterprise Success Manager', '2023-10-10', FALSE);

-- Update Department heads
UPDATE departments SET head_user_id = 12 WHERE id = 2; -- Vikram -> ENG
UPDATE departments SET head_user_id = 6 WHERE id = 3;  -- Akash -> PROD
UPDATE departments SET head_user_id = 5 WHERE id = 4;  -- Rahul -> QA
UPDATE departments SET head_user_id = 27 WHERE id = 5; -- Sunita -> IT
UPDATE departments SET head_user_id = 3 WHERE id = 6;  -- Sneha -> HR
UPDATE departments SET head_user_id = 9 WHERE id = 7;  -- Divya -> FIN
UPDATE departments SET head_user_id = 7 WHERE id = 8;  -- Neha -> SALES
UPDATE departments SET head_user_id = 29 WHERE id = 9; -- Kunal -> MKTG
UPDATE departments SET head_user_id = 21 WHERE id = 10; -- Suresh -> CS
UPDATE departments SET head_user_id = 22 WHERE id = 11; -- Harish -> LEGAL
UPDATE departments SET head_user_id = 24 WHERE id = 12; -- Tushar -> RND

-- 3. SEED ASSET CATEGORIES
INSERT INTO asset_categories (id, name, code, description, depreciation_rate, useful_life_years) VALUES
(1, 'Laptops', 'LAP', 'Corporate laptops and notebooks', 25.00, 4),
(2, 'Monitors', 'MON', 'Desktop displays and monitors', 10.00, 10),
(3, 'Keyboards', 'KB', 'Computer keyboards', 20.00, 5),
(4, 'Mouse', 'MS', 'Computer mice', 20.00, 5),
(5, 'Mobile Phones', 'MOB', 'Smartphones and mobile devices', 33.33, 3),
(6, 'Tablets', 'TAB', 'Corporate tablets', 25.00, 4),
(7, 'Servers', 'SRV', 'Data center and office server hardware', 20.00, 5),
(8, 'Networking Equipment', 'NET', 'Switches, routers, and access points', 20.00, 5),
(9, 'Projectors', 'PROJ', 'Meeting room projectors', 15.00, 7),
(10, 'Meeting Room Equipment', 'CONF', 'Conference bars, cameras, and audio sets', 15.00, 7),
(11, 'Printers', 'PRN', 'Printers and scanners', 20.00, 5),
(12, 'Furniture', 'FURN', 'Office desks, chairs, and pods', 10.00, 10),
(13, 'Vehicles', 'VEH', 'Corporate fleet cars and vans', 12.50, 8),
(14, 'Access Cards', 'CARD', 'NFC & RFID employee access badges', 100.00, 1),
(15, 'Software Licenses', 'SW', 'Enterprise software subscriptions', 33.33, 3);

ALTER SEQUENCE asset_categories_id_seq RESTART WITH 16;

-- 4. SEED ASSETS (90 Realistic Assets)
-- Statuses: AVAILABLE, ALLOCATED, RESERVED, MAINTENANCE, LOST, RETIRED, DISPOSED
-- Conditions: EXCELLENT, GOOD, FAIR, POOR, DAMAGED
INSERT INTO assets (id, asset_tag, name, description, category_id, status, condition, location, department_id, serial_number, model, manufacturer, vendor, purchase_date, purchase_price, current_value, warranty_expiry, created_by_user_id) VALUES
-- Laptops (1-15)
(1, 'AF-0001', 'Dell Latitude 7440', 'Core i7, 16GB RAM, 512GB SSD', 1, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-DL7440-101', 'Latitude 7440', 'Dell', 'Dell Direct', '2024-01-10', 1200.00, 1050.00, '2027-01-10', 1),
(2, 'AF-0002', 'Apple MacBook Pro 14" M3', 'Apple M3 Pro, 18GB Unified RAM, 512GB SSD', 1, 'AVAILABLE', 'EXCELLENT', 'IT Storage', 5, 'SN-MBPM3-102', 'MacBook Pro 14" M3', 'Apple', 'Apple Store Business', '2024-02-15', 1999.00, 1850.00, '2025-02-15', 1),
(3, 'AF-0003', 'Lenovo ThinkPad X1 Carbon Gen 12', 'Core Ultra 7, 32GB RAM, 1TB SSD', 1, 'MAINTENANCE', 'GOOD', 'Server Room', 5, 'SN-TPX1-103', 'ThinkPad X1 Carbon', 'Lenovo', 'Lenovo Partner', '2024-03-01', 1850.00, 1700.00, '2027-03-01', 1),
(4, 'AF-0004', 'HP EliteBook 840 G11', 'Ryzen 7, 16GB RAM, 512GB SSD', 1, 'ALLOCATED', 'GOOD', 'Sales Wing', 8, 'SN-EB840-104', 'EliteBook 840', 'HP', 'HP Corporate Sales', '2024-02-05', 1100.00, 950.00, '2027-02-05', 1),
(5, 'AF-0005', 'Apple MacBook Air M3', 'M3, 16GB RAM, 512GB SSD', 1, 'ALLOCATED', 'EXCELLENT', 'Marketing Bay', 9, 'SN-MBAM3-105', 'MacBook Air M3', 'Apple', 'Apple Store Business', '2024-03-10', 1299.00, 1200.00, '2025-03-10', 1),
(6, 'AF-0006', 'Dell Precision 5680', 'Core i9, 64GB RAM, 2TB SSD, RTX 4070', 1, 'ALLOCATED', 'EXCELLENT', 'Innovation Lab', 12, 'SN-DP5680-106', 'Precision 5680', 'Dell', 'Dell Direct', '2024-01-20', 3200.00, 2900.00, '2027-01-20', 1),
(7, 'AF-0007', 'Lenovo ThinkPad T14 Gen 5', 'Core i5, 16GB RAM, 512GB SSD', 1, 'ALLOCATED', 'GOOD', 'Engineering Bay', 2, 'SN-TPT14-107', 'ThinkPad T14', 'Lenovo', 'Lenovo Partner', '2023-06-15', 950.00, 700.00, '2026-06-15', 1),
(8, 'AF-0008', 'Apple MacBook Pro 16" M3 Max', 'M3 Max, 64GB RAM, 2TB SSD', 1, 'ALLOCATED', 'EXCELLENT', 'Innovation Lab', 12, 'SN-MBP16-108', 'MacBook Pro 16" M3 Max', 'Apple', 'Apple Store Business', '2024-04-01', 3999.00, 3800.00, '2025-04-01', 1),
(9, 'AF-0009', 'Dell Latitude 5440', 'Core i5, 16GB RAM, 256GB SSD', 1, 'ALLOCATED', 'GOOD', 'Customer Success Bay', 10, 'SN-DL5440-109', 'Latitude 5440', 'Dell', 'Dell Direct', '2023-11-10', 850.00, 720.00, '2026-11-10', 1),
(10, 'AF-0010', 'HP ProBook 445 G10', 'Ryzen 5, 8GB RAM, 256GB SSD', 1, 'RETIRED', 'POOR', 'IT Storage', 5, 'SN-PB445-110', 'ProBook 445', 'HP', 'HP Corporate Sales', '2021-02-15', 600.00, 100.00, '2024-02-15', 1),
(11, 'AF-0011', 'Apple MacBook Pro 14" M2', 'M2 Pro, 16GB RAM, 512GB SSD', 1, 'ALLOCATED', 'GOOD', 'Product Management', 3, 'SN-MBPM2-111', 'MacBook Pro 14" M2', 'Apple', 'Apple Store Business', '2023-04-18', 1999.00, 1400.00, '2026-04-18', 1), -- Expiry 5 Days Alert (relative to current date - simulated below)
(12, 'AF-0012', 'Dell Latitude 7440', 'Core i7, 16GB RAM, 512GB SSD', 1, 'ALLOCATED', 'EXCELLENT', 'Finance Section', 7, 'SN-DL7440-112', 'Latitude 7440', 'Dell', 'Dell Direct', '2024-01-10', 1200.00, 1050.00, '2027-01-10', 1),
(13, 'AF-0013', 'Lenovo ThinkPad X1 Carbon Gen 10', 'Core i7, 16GB RAM, 512GB SSD', 1, 'ALLOCATED', 'FAIR', 'QA Section', 4, 'SN-TPX1-113', 'ThinkPad X1 Carbon', 'Lenovo', 'Lenovo Partner', '2022-09-01', 1700.00, 900.00, '2025-09-01', 1),
(14, 'AF-0014', 'HP EliteBook 840 G10', 'Core i7, 16GB RAM, 512GB SSD', 1, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-EB840-114', 'EliteBook 840', 'HP', 'HP Corporate Sales', '2023-08-05', 1200.00, 950.00, '2026-08-05', 1),
(15, 'AF-0015', 'Apple MacBook Air M2', 'M2, 8GB RAM, 256GB SSD', 1, 'ALLOCATED', 'GOOD', 'HR Department', 6, 'SN-MBAM2-115', 'MacBook Air M2', 'Apple', 'Apple Store Business', '2022-07-20', 1099.00, 650.00, '2025-07-20', 1),

-- Monitors (16-30)
(16, 'AF-0016', 'Dell UltraSharp U2723QE', '27" 4K USB-C Hub Monitor', 2, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-MON-201', 'U2723QE', 'Dell', 'Dell Direct', '2023-11-20', 550.00, 480.00, '2026-11-20', 1),
(17, 'AF-0017', 'Dell UltraSharp U2723QE', '27" 4K USB-C Hub Monitor', 2, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-MON-202', 'U2723QE', 'Dell', 'Dell Direct', '2023-11-20', 550.00, 480.00, '2026-11-20', 1),
(18, 'AF-0018', 'Dell UltraSharp U2723QE', '27" 4K USB-C Hub Monitor', 2, 'ALLOCATED', 'GOOD', 'Product PM Bay', 3, 'SN-MON-203', 'U2723QE', 'Dell', 'Dell Direct', '2023-11-20', 550.00, 480.00, '2026-11-20', 1),
(19, 'AF-0019', 'Dell UltraSharp U2723QE', '27" 4K USB-C Hub Monitor', 2, 'AVAILABLE', 'EXCELLENT', 'IT Storage', 5, 'SN-MON-204', 'U2723QE', 'Dell', 'Dell Direct', '2023-11-20', 550.00, 480.00, '2026-11-20', 1),
(20, 'AF-0020', 'LG UltraFine 27"', '27" UHD Monitor with Ergonomic Stand', 2, 'ALLOCATED', 'GOOD', 'QA Section', 4, 'SN-MON-205', 'LG-27UN880', 'LG', 'Amazon Business', '2023-05-14', 450.00, 380.00, '2026-05-14', 1),
(21, 'AF-0021', 'LG UltraFine 27"', '27" UHD Monitor with Ergonomic Stand', 2, 'ALLOCATED', 'GOOD', 'QA Section', 4, 'SN-MON-206', 'LG-27UN880', 'LG', 'Amazon Business', '2023-05-14', 450.00, 380.00, '2026-05-14', 1),
(22, 'AF-0022', 'Samsung ViewFinity S8', '27" Professional Monitor', 2, 'ALLOCATED', 'EXCELLENT', 'Marketing Bay', 9, 'SN-MON-207', 'S27B800', 'Samsung', 'Samsung Enterprise', '2023-10-05', 400.00, 350.00, '2026-10-05', 1),
(23, 'AF-0023', 'Samsung ViewFinity S8', '27" Professional Monitor', 2, 'ALLOCATED', 'EXCELLENT', 'Innovation Lab', 12, 'SN-MON-208', 'S27B800', 'Samsung', 'Samsung Enterprise', '2023-10-05', 400.00, 350.00, '2026-10-05', 1),
(24, 'AF-0024', 'Dell P2422H', '24" Full HD Business Monitor', 2, 'ALLOCATED', 'GOOD', 'Customer Success Bay', 10, 'SN-MON-209', 'P2422H', 'Dell', 'Dell Direct', '2022-04-10', 200.00, 130.00, '2025-04-10', 1),
(25, 'AF-0025', 'Dell P2422H', '24" Full HD Business Monitor', 2, 'ALLOCATED', 'GOOD', 'Customer Success Bay', 10, 'SN-MON-210', 'P2422H', 'Dell', 'Dell Direct', '2022-04-10', 200.00, 130.00, '2025-04-10', 1),
(26, 'AF-0026', 'Dell P2422H', '24" Full HD Business Monitor', 2, 'ALLOCATED', 'GOOD', 'Finance Section', 7, 'SN-MON-211', 'P2422H', 'Dell', 'Dell Direct', '2022-04-10', 200.00, 130.00, '2025-04-10', 1),
(27, 'AF-0027', 'Dell P2422H', '24" Full HD Business Monitor', 2, 'ALLOCATED', 'FAIR', 'HR Department', 6, 'SN-MON-212', 'P2422H', 'Dell', 'Dell Direct', '2022-04-10', 200.00, 130.00, '2025-04-10', 1),
(28, 'AF-0028', 'Dell P2422H', '24" Full HD Business Monitor', 2, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-MON-213', 'P2422H', 'Dell', 'Dell Direct', '2022-04-10', 200.00, 130.00, '2025-04-10', 1),
(29, 'AF-0029', 'LG UltraFine 27"', '27" UHD Monitor with Ergonomic Stand', 2, 'LOST', 'FAIR', 'Unknown Location', 5, 'SN-MON-214', 'LG-27UN880', 'LG', 'Amazon Business', '2023-05-14', 450.00, 300.00, '2026-05-14', 1),
(30, 'AF-0030', 'BenQ EW3270U', '32" 4K Video Enjoyment Monitor', 2, 'ALLOCATED', 'GOOD', 'Sales Wing', 8, 'SN-MON-215', 'EW3270U', 'BenQ', 'Amazon Business', '2022-08-11', 350.00, 200.00, '2025-08-11', 1),

-- Keyboards & Mice (31-45)
(31, 'AF-0031', 'Logitech MX Keys S', 'Premium Wireless Keyboard', 3, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-KB-301', 'MX Keys S', 'Logitech', 'Logitech Distributor', '2024-01-20', 119.00, 110.00, '2025-01-20', 1),
(32, 'AF-0032', 'Logitech MX Master 3S', 'Premium Wireless Ergonomic Mouse', 4, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-MS-302', 'MX Master 3S', 'Logitech', 'Logitech Distributor', '2024-01-20', 99.00, 90.00, '2025-01-20', 1),
(33, 'AF-0033', 'Logitech MX Keys S', 'Premium Wireless Keyboard', 3, 'ALLOCATED', 'GOOD', 'Product PM Bay', 3, 'SN-KB-303', 'MX Keys S', 'Logitech', 'Logitech Distributor', '2023-05-10', 119.00, 80.00, '2024-05-10', 1),
(34, 'AF-0034', 'Logitech MX Master 3S', 'Premium Wireless Ergonomic Mouse', 4, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-MS-304', 'MX Master 3S', 'Logitech', 'Logitech Distributor', '2023-05-10', 99.00, 70.00, '2024-05-10', 1),
(35, 'AF-0035', 'Keychron K8 Pro', 'Wireless Mechanical Keyboard', 3, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-KB-305', 'K8 Pro', 'Keychron', 'Keychron Official', '2023-09-01', 120.00, 100.00, '2024-09-01', 1),
(36, 'AF-0036', 'Logitech Lift', 'Ergonomic Vertical Mouse', 4, 'ALLOCATED', 'GOOD', 'HR Department', 6, 'SN-MS-306', 'Lift Vertical', 'Logitech', 'Logitech Distributor', '2023-11-05', 69.00, 50.00, '2024-11-05', 1),
(37, 'AF-0037', 'Logitech K120', 'Wired Business Keyboard', 3, 'ALLOCATED', 'GOOD', 'Customer Success Bay', 10, 'SN-KB-307', 'K120', 'Logitech', 'IT Distributor', '2022-04-10', 15.00, 8.00, '2025-04-10', 1),
(38, 'AF-0038', 'Logitech M100', 'Wired Business Mouse', 4, 'ALLOCATED', 'GOOD', 'Customer Success Bay', 10, 'SN-MS-308', 'M100', 'Logitech', 'IT Distributor', '2022-04-10', 10.00, 5.00, '2025-04-10', 1),
(39, 'AF-0039', 'Apple Magic Keyboard', 'Wireless Keyboard for Mac', 3, 'ALLOCATED', 'GOOD', 'Innovation Lab', 12, 'SN-KB-309', 'Magic Keyboard', 'Apple', 'Apple Store Business', '2023-10-05', 99.00, 75.00, '2024-10-05', 1),
(40, 'AF-0040', 'Apple Magic Mouse', 'Wireless Mouse for Mac', 4, 'ALLOCATED', 'GOOD', 'Innovation Lab', 12, 'SN-MS-310', 'Magic Mouse', 'Apple', 'Apple Store Business', '2023-10-05', 79.00, 60.00, '2024-10-05', 1),
(41, 'AF-0041', 'Keychron K2', 'Compact Wireless Mechanical Keyboard', 3, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-KB-311', 'K2', 'Keychron', 'Keychron Official', '2024-02-10', 99.00, 90.00, '2025-02-10', 1),
(42, 'AF-0042', 'Logitech G502 Hero', 'Wired Gaming/Development Mouse', 4, 'ALLOCATED', 'GOOD', 'Engineering Bay', 2, 'SN-MS-312', 'G502 Hero', 'Logitech', 'Logitech Distributor', '2023-03-12', 79.00, 50.00, '2024-03-12', 1),
(43, 'AF-0043', 'Dell KM3322W', 'Wireless Keyboard & Mouse Combo', 3, 'ALLOCATED', 'GOOD', 'Finance Section', 7, 'SN-KB-313', 'KM3322W', 'Dell', 'Dell Direct', '2023-01-10', 35.00, 20.00, '2026-01-10', 1),
(44, 'AF-0044', 'Dell KM3322W', 'Wireless Keyboard & Mouse Combo', 3, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-KB-314', 'KM3322W', 'Dell', 'Dell Direct', '2023-01-10', 35.00, 20.00, '2026-01-10', 1),
(45, 'AF-0045', 'Logitech MX Keys S', 'Premium Wireless Keyboard', 3, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-KB-315', 'MX Keys S', 'Logitech', 'Logitech Distributor', '2023-05-10', 119.00, 80.00, '2024-05-10', 1),

-- Mobile Phones & Tablets (46-55)
(46, 'AF-0046', 'iPhone 15 Pro 256GB', 'Enterprise Smartphone - Space Black', 5, 'ALLOCATED', 'EXCELLENT', 'Sales Wing', 8, 'SN-PHN-401', 'iPhone 15 Pro', 'Apple', 'Apple Store Business', '2023-10-15', 1099.00, 950.00, '2024-10-15', 1),
(47, 'AF-0047', 'Samsung Galaxy S24 256GB', 'Enterprise Android Smartphone', 5, 'ALLOCATED', 'EXCELLENT', 'Marketing Bay', 9, 'SN-PHN-402', 'Galaxy S24', 'Samsung', 'Samsung Enterprise', '2024-02-20', 899.00, 800.00, '2025-02-20', 1),
(48, 'AF-0048', 'iPad Pro 11" M2 WiFi 128GB', 'Enterprise Design Tablet', 6, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-TAB-403', 'iPad Pro 11"', 'Apple', 'Apple Store Business', '2023-06-05', 799.00, 650.00, '2025-06-05', 1),
(49, 'AF-0049', 'Samsung Galaxy Tab S9', 'Android Tablet for CS team', 6, 'ALLOCATED', 'EXCELLENT', 'Customer Success Bay', 10, 'SN-TAB-404', 'Galaxy Tab S9', 'Samsung', 'Samsung Enterprise', '2023-09-12', 699.00, 580.00, '2025-09-12', 1),
(50, 'AF-0050', 'iPhone 14 128GB', 'Standard Employee Phone', 5, 'ALLOCATED', 'GOOD', 'HR Department', 6, 'SN-PHN-405', 'iPhone 14', 'Apple', 'Apple Store Business', '2022-11-20', 799.00, 500.00, '2024-11-20', 1),
(51, 'AF-0051', 'iPhone 15 Pro 256GB', 'Enterprise Smartphone - Space Black', 5, 'AVAILABLE', 'EXCELLENT', 'IT Storage', 5, 'SN-PHN-406', 'iPhone 15 Pro', 'Apple', 'Apple Store Business', '2023-10-15', 1099.00, 950.00, '2024-10-15', 1),
(52, 'AF-0052', 'Samsung Galaxy S24 256GB', 'Enterprise Android Smartphone', 5, 'AVAILABLE', 'EXCELLENT', 'IT Storage', 5, 'SN-PHN-407', 'Galaxy S24', 'Samsung', 'Samsung Enterprise', '2024-02-20', 899.00, 800.00, '2025-02-20', 1),
(53, 'AF-0053', 'iPad Air M1 WiFi 64GB', 'General Purpose Tablet', 6, 'ALLOCATED', 'GOOD', 'Sales Wing', 8, 'SN-TAB-408', 'iPad Air M1', 'Apple', 'Apple Store Business', '2022-05-18', 599.00, 350.00, '2025-05-18', 1),
(54, 'AF-0054', 'iPhone 13 128GB', 'Standard Employee Phone', 5, 'LOST', 'FAIR', 'Unknown Location', 5, 'SN-PHN-409', 'iPhone 13', 'Apple', 'Apple Store Business', '2022-03-01', 699.00, 300.00, '2024-03-01', 1),
(55, 'AF-0055', 'iPad Pro 12.9" M2 256GB', 'Design and UX Tablet', 6, 'ALLOCATED', 'EXCELLENT', 'Product Management', 3, 'SN-TAB-410', 'iPad Pro 12.9"', 'Apple', 'Apple Store Business', '2023-07-15', 1099.00, 900.00, '2025-07-15', 1),

-- Servers & Networking (56-65)
(56, 'AF-0056', 'Dell PowerEdge R760 Server', '2x Intel Xeon, 256GB RAM, 8x 1.92TB NVMe SSD', 7, 'AVAILABLE', 'EXCELLENT', 'Server Room', 5, 'SN-SRV-501', 'PowerEdge R760', 'Dell', 'Dell Enterprise', '2024-02-01', 8500.00, 8200.00, '2029-02-01', 1),
(57, 'AF-0057', 'Dell PowerEdge R760 Server', '2x Intel Xeon, 256GB RAM, 8x 1.92TB NVMe SSD', 7, 'AVAILABLE', 'EXCELLENT', 'Server Room', 5, 'SN-SRV-502', 'PowerEdge R760', 'Dell', 'Dell Enterprise', '2024-02-01', 8500.00, 8200.00, '2029-02-01', 1),
(58, 'AF-0058', 'Cisco Catalyst 9300 Switch', '48-Port PoE+ Network Switch', 8, 'AVAILABLE', 'GOOD', 'Server Room', 5, 'SN-NET-503', 'Catalyst 9300', 'Cisco', 'Cisco Partner', '2023-04-10', 4500.00, 4000.00, '2026-04-10', 1), -- Expiry Alert (simulated)
(59, 'AF-0059', 'Ubiquiti UniFi Dream Machine Pro', 'Enterprise Security Gateway & Router', 8, 'AVAILABLE', 'EXCELLENT', 'Server Room', 5, 'SN-NET-504', 'UniFi UDM-Pro', 'Ubiquiti', 'Ubiquiti Retail', '2023-08-15', 499.00, 450.00, '2025-08-15', 1),
(60, 'AF-0060', 'Cisco Catalyst 9300 Switch', '48-Port PoE+ Network Switch', 8, 'AVAILABLE', 'GOOD', 'Server Room', 5, 'SN-NET-505', 'Catalyst 9300', 'Cisco', 'Cisco Partner', '2021-01-10', 4500.00, 2000.00, '2024-01-10', 1), -- Expired Alert (relative to 2026)
(61, 'AF-0061', 'Ubiquiti UniFi Switch Pro 48 PoE', '48-Port Managed PoE Gigabit Switch', 8, 'AVAILABLE', 'EXCELLENT', 'Server Room', 5, 'SN-NET-506', 'UniFi USW-Pro-48-PoE', 'Ubiquiti', 'Ubiquiti Retail', '2023-11-20', 1099.00, 1000.00, '2025-11-20', 1),
(62, 'AF-0062', 'HPE ProLiant DL380 Gen11 Server', '1x Intel Xeon, 64GB RAM, 4x 960GB SSD', 7, 'AVAILABLE', 'GOOD', 'Server Room', 5, 'SN-SRV-507', 'ProLiant DL380 Gen11', 'HPE', 'HPE Direct', '2023-07-10', 5200.00, 4600.00, '2026-07-10', 1),
(63, 'AF-0063', 'Ubiquiti UniFi AP AC Pro', 'Dual-Band Wireless Access Point', 8, 'AVAILABLE', 'GOOD', 'Reception Area', 5, 'SN-NET-508', 'UniFi AP-AC-Pro', 'Ubiquiti', 'Ubiquiti Retail', '2022-09-05', 149.00, 90.00, '2025-09-05', 1),
(64, 'AF-0064', 'Ubiquiti UniFi AP AC Pro', 'Dual-Band Wireless Access Point', 8, 'AVAILABLE', 'GOOD', 'Conference Wing', 5, 'SN-NET-509', 'UniFi AP-AC-Pro', 'Ubiquiti', 'Ubiquiti Retail', '2022-09-05', 149.00, 90.00, '2025-09-05', 1),
(65, 'AF-0065', 'Fortinet FortiGate 60F', 'Enterprise Security Next-Gen Firewall', 8, 'AVAILABLE', 'EXCELLENT', 'Server Room', 5, 'SN-NET-510', 'FortiGate 60F', 'Fortinet', 'Fortinet Partner', '2023-10-12', 899.00, 800.00, '2026-10-12', 1),

-- Projectors & Meeting Room Equipment (66-75)
(66, 'AF-0066', 'Epson EB-2250U Projector', '5000-Lumen Full HD Business Projector', 9, 'RESERVED', 'GOOD', 'Conference Wing', 1, 'SN-PROJ-601', 'EB-2250U', 'Epson', 'IT Source', '2023-02-18', 1250.00, 950.00, '2026-02-18', 1),
(67, 'AF-0067', 'BenQ LH720 Projector', '4000-Lumen Laser Meeting Room Projector', 9, 'AVAILABLE', 'EXCELLENT', 'IT Storage', 5, 'SN-PROJ-602', 'LH720', 'BenQ', 'Amazon Business', '2024-01-05', 1499.00, 1350.00, '2027-01-05', 1),
(68, 'AF-0068', 'Logitech Rally Bar', 'All-in-one Video Conferencing Bar', 10, 'ALLOCATED', 'EXCELLENT', 'Conference Wing (Orion)', 1, 'SN-CONF-603', 'Rally Bar', 'Logitech', 'Logitech Distributor', '2023-11-15', 2999.00, 2700.00, '2025-11-15', 1),
(69, 'AF-0069', 'Logitech Rally Bar Mini', 'Conferencing Bar for Medium Rooms', 10, 'ALLOCATED', 'EXCELLENT', 'Conference Wing (Phoenix)', 1, 'SN-CONF-604', 'Rally Bar Mini', 'Logitech', 'Logitech Distributor', '2023-11-15', 1999.00, 1800.00, '2025-11-15', 1),
(70, 'AF-0070', 'Jabra Speak 750', 'Wireless Bluetooth Speakerphone', 10, 'ALLOCATED', 'GOOD', 'Engineering Bay', 2, 'SN-CONF-605', 'Speak 750', 'Jabra', 'Amazon Business', '2023-04-10', 329.00, 240.00, '2025-04-10', 1),
(71, 'AF-0071', 'Poly Studio X30', 'Video Bar for Huddle Rooms', 10, 'ALLOCATED', 'GOOD', 'Conference Wing (Pegasus)', 1, 'SN-CONF-606', 'Studio X30', 'Poly', 'Poly Partner', '2023-06-18', 1599.00, 1300.00, '2025-06-18', 1),
(72, 'AF-0072', 'Jabra Speak 750', 'Wireless Bluetooth Speakerphone', 10, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-CONF-607', 'Speak 750', 'Jabra', 'Amazon Business', '2023-04-10', 329.00, 240.00, '2025-04-10', 1),
(73, 'AF-0073', 'Epson EB-2250U Projector', '5000-Lumen Full HD Business Projector', 9, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-PROJ-608', 'EB-2250U', 'Epson', 'IT Source', '2023-02-18', 1250.00, 950.00, '2026-02-18', 1),
(74, 'AF-0074', 'Jabra Panacast 50', '180-Degree 4K Panoramic Video Bar', 10, 'ALLOCATED', 'EXCELLENT', 'Conference Wing (Atlas)', 1, 'SN-CONF-609', 'Panacast 50', 'Jabra', 'Jabra Partner', '2024-01-20', 1199.00, 1080.00, '2026-01-20', 1),
(75, 'AF-0075', 'Logitech Rally Bar', 'All-in-one Video Conferencing Bar', 10, 'ALLOCATED', 'EXCELLENT', 'Conference Wing (Mercury)', 1, 'SN-CONF-610', 'Rally Bar', 'Logitech', 'Logitech Distributor', '2023-11-15', 2999.00, 2700.00, '2025-11-15', 1),

-- Printers & Furniture (76-85)
(76, 'AF-0076', 'HP LaserJet Pro MFP 4101', 'Mono Laser Multifunction Printer', 11, 'AVAILABLE', 'GOOD', 'Reception Area', 10, 'SN-PRN-701', 'LaserJet Pro MFP 4101', 'HP', 'IT Source', '2022-09-12', 429.00, 300.00, '2025-09-12', 1),
(77, 'AF-0077', 'Brother HL-L6400DW', 'Business Laser Printer', 11, 'AVAILABLE', 'GOOD', 'Engineering Bay', 2, 'SN-PRN-702', 'HL-L6400DW', 'Brother', 'IT Source', '2022-10-18', 549.00, 380.00, '2025-10-18', 1),
(78, 'AF-0078', 'HP LaserJet Pro MFP 4101', 'Mono Laser Multifunction Printer', 11, 'AVAILABLE', 'GOOD', 'Sales Wing', 8, 'SN-PRN-703', 'LaserJet Pro MFP 4101', 'HP', 'IT Source', '2022-09-12', 429.00, 300.00, '2025-09-12', 1),
(79, 'AF-0079', 'Steelcase Gesture Chair', 'Premium Ergonomic Office Chair', 12, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-FURN-704', 'Gesture', 'Steelcase', 'Steelcase Store', '2023-12-01', 1100.00, 1000.00, '2033-12-01', 1),
(80, 'AF-0080', 'Steelcase Gesture Chair', 'Premium Ergonomic Office Chair', 12, 'ALLOCATED', 'EXCELLENT', 'Engineering Bay', 2, 'SN-FURN-705', 'Gesture', 'Steelcase', 'Steelcase Store', '2023-12-01', 1100.00, 1000.00, '2033-12-01', 1),
(81, 'AF-0081', 'Steelcase Gesture Chair', 'Premium Ergonomic Office Chair', 12, 'ALLOCATED', 'GOOD', 'Product PM Bay', 3, 'SN-FURN-706', 'Gesture', 'Steelcase', 'Steelcase Store', '2023-12-01', 1100.00, 1000.00, '2033-12-01', 1),
(82, 'AF-0082', 'Herman Miller Aeron Chair', 'Classic Ergonomic Office Chair', 12, 'ALLOCATED', 'GOOD', 'HR Department', 6, 'SN-FURN-707', 'Aeron', 'Herman Miller', 'HM Business', '2022-06-15', 1400.00, 1100.00, '2032-06-15', 1),
(83, 'AF-0083', 'Steelcase Gesture Chair', 'Premium Ergonomic Office Chair', 12, 'ALLOCATED', 'GOOD', 'Customer Success Bay', 10, 'SN-FURN-708', 'Gesture', 'Steelcase', 'Steelcase Store', '2023-12-01', 1100.00, 1000.00, '2033-12-01', 1),
(84, 'AF-0084', 'Brother HL-L6400DW', 'Business Laser Printer', 11, 'DISPOSED', 'DAMAGED', 'Scrap Yard', 5, 'SN-PRN-709', 'HL-L6400DW', 'Brother', 'IT Source', '2020-05-18', 549.00, 0.00, '2023-05-18', 1),
(85, 'AF-0085', 'Steelcase Gesture Chair', 'Premium Ergonomic Office Chair', 12, 'AVAILABLE', 'GOOD', 'IT Storage', 5, 'SN-FURN-710', 'Gesture', 'Steelcase', 'Steelcase Store', '2023-12-01', 1100.00, 1000.00, '2033-12-01', 1),

-- Vehicles & Access Cards & Licenses (86-90)
(86, 'AF-0086', 'Toyota Camry Hybrid 2024', 'Corporate Fleet Sedan - Silver', 13, 'RESERVED', 'EXCELLENT', 'Parking B1', 1, 'VIN-TOY-801', 'Camry Hybrid', 'Toyota', 'Toyota Corporate Lease', '2024-01-15', 35000.00, 32000.00, '2027-01-15', 1),
(87, 'AF-0087', 'Ford Transit Cargo Van 2023', 'Facilities Support Cargo Van - White', 13, 'ALLOCATED', 'GOOD', 'Parking B1', 1, 'VIN-FOR-802', 'Transit Van', 'Ford', 'Ford Fleet Sales', '2023-05-10', 42000.00, 35000.00, '2026-05-10', 1),
(88, 'AF-0088', 'JetBrains All Products Pack License', 'JetBrains software subscription for 20 developers', 15, 'ALLOCATED', 'EXCELLENT', 'Cloud / Digital', 2, 'LIC-JB-803', 'All Products Pack', 'JetBrains', 'JetBrains Reseller', '2024-03-01', 10000.00, 8000.00, '2025-03-01', 1), -- Expiry 15 Days Alert (relative to 2024-03-01 + 1 yr)
(89, 'AF-0089', 'Salesforce Enterprise Edition', 'Salesforce CRM Licenses for 30 agents', 15, 'ALLOCATED', 'EXCELLENT', 'Cloud / Digital', 8, 'LIC-SF-804', 'Salesforce Enterprise', 'Salesforce', 'Salesforce Direct', '2024-02-15', 45000.00, 42000.00, '2025-02-15', 1),
(90, 'AF-0090', 'Jira Cloud Premium Subscription', 'Atlassian Jira subscriptions for 100 users', 15, 'ALLOCATED', 'EXCELLENT', 'Cloud / Digital', 5, 'LIC-JIRA-805', 'Jira Premium', 'Atlassian', 'Atlassian Portal', '2024-01-10', 15000.00, 13000.00, '2025-01-10', 1);

-- Auto-reset Sequence for assets
ALTER SEQUENCE assets_id_seq RESTART WITH 91;

-- 5. SEED ALLOCATIONS (20 Allocations)
-- Statuses: ACTIVE, RETURNED, TRANSFERRED, OVERDUE
-- Allocated By: Admin (1) or Priya Sharma (2)
INSERT INTO allocations (id, asset_id, allocated_to_user_id, allocated_by_user_id, department_id, status, allocation_date, expected_return_date, actual_return_date, condition_at_allocation, condition_at_return, notes) VALUES
(1, 1, 4, 2, 2, 'ACTIVE', '2024-01-10 09:20:00+05:30', NULL, NULL, 'EXCELLENT', NULL, 'Assigned to Arjun Kumar upon onboarding'),
(2, 4, 7, 1, 8, 'ACTIVE', '2024-02-05 10:15:00+05:30', NULL, NULL, 'GOOD', NULL, 'Allocated to Sales VP Neha Gupta'),
(3, 5, 10, 2, 9, 'ACTIVE', '2024-03-10 11:30:00+05:30', NULL, NULL, 'EXCELLENT', NULL, 'Assigned to Vivek Reddy for design projects'),
(4, 6, 24, 1, 12, 'ACTIVE', '2024-01-20 14:00:00+05:30', NULL, NULL, 'EXCELLENT', NULL, 'Assigned to Tushar Saxena for AI models training'),
(5, 7, 11, 2, 2, 'ACTIVE', '2023-06-15 09:45:00+05:30', NULL, NULL, 'GOOD', NULL, 'Allocated to Ananya Rao'),
(6, 8, 23, 1, 12, 'ACTIVE', '2024-04-01 10:00:00+05:30', NULL, NULL, 'EXCELLENT', NULL, 'Allocated to Ranjana Nair'),
(7, 9, 20, 2, 10, 'ACTIVE', '2023-11-10 11:00:00+05:30', NULL, NULL, 'GOOD', NULL, 'Assigned to Aditi Bose'),
(8, 11, 6, 2, 3, 'ACTIVE', '2023-04-18 10:30:00+05:30', NULL, NULL, 'GOOD', NULL, 'Allocated to Akash Verma'),
(9, 12, 9, 1, 7, 'ACTIVE', '2024-01-10 09:30:00+05:30', NULL, NULL, 'EXCELLENT', NULL, 'Assigned to CFO Divya Nair'),
(10, 13, 14, 2, 4, 'ACTIVE', '2022-09-01 09:00:00+05:30', NULL, NULL, 'GOOD', NULL, 'Allocated to Kavita Patel'),
(11, 15, 3, 1, 6, 'ACTIVE', '2022-07-20 09:15:00+05:30', NULL, NULL, 'GOOD', NULL, 'Assigned to HR Head Sneha Iyer'),
(12, 16, 4, 2, 2, 'ACTIVE', '2023-11-20 10:00:00+05:30', NULL, NULL, 'EXCELLENT', NULL, 'Monitor assigned to Arjun Kumar'),
(13, 17, 12, 2, 2, 'ACTIVE', '2023-11-20 10:05:00+05:30', NULL, NULL, 'EXCELLENT', NULL, 'Monitor assigned to Vikram Singh'),
(14, 18, 6, 2, 3, 'ACTIVE', '2023-11-20 10:10:00+05:30', NULL, NULL, 'GOOD', NULL, 'Monitor assigned to Akash Verma'),
(15, 20, 5, 2, 4, 'ACTIVE', '2023-05-14 09:30:00+05:30', NULL, NULL, 'GOOD', NULL, 'Monitor assigned to Rahul Menon'),
(16, 22, 10, 2, 9, 'ACTIVE', '2023-10-05 14:30:00+05:30', NULL, NULL, 'EXCELLENT', NULL, 'Monitor assigned to Vivek Reddy'),
(17, 24, 20, 2, 10, 'ACTIVE', '2022-04-10 09:45:00+05:30', NULL, NULL, 'GOOD', NULL, 'Monitor assigned to Aditi Bose'),
(18, 3, 5, 2, 4, 'RETURNED', '2023-03-01 10:00:00+05:30', '2024-03-01', '2024-07-01 11:00:00+05:30', 'GOOD', 'GOOD', 'Returned by Rahul Menon for maintenance'),
(19, 29, 18, 2, 8, 'OVERDUE', '2023-05-14 09:15:00+05:30', '2024-05-14', NULL, 'GOOD', NULL, 'Assigned to Shreya Sen, overdue return since May 2024'),
(20, 87, 1, 1, 1, 'ACTIVE', '2023-05-10 09:00:00+05:30', NULL, NULL, 'GOOD', NULL, 'Allocated to Admin for transport/support fleet');

ALTER SEQUENCE allocations_id_seq RESTART WITH 21;

-- 6. SEED BOOKABLE RESOURCES
-- Types: MEETING_ROOM, PROJECTOR, VEHICLE, EQUIPMENT
INSERT INTO bookable_resources (id, name, type, location, capacity, description, is_active) VALUES
(1, 'Orion (Large Room)', 'MEETING_ROOM', 'Conference Wing, Ground Floor', 20, 'Executive boardroom with complete VC system and glass board', TRUE),
(2, 'Phoenix (Medium Room)', 'MEETING_ROOM', 'Conference Wing, Ground Floor', 12, 'Conferencing room with digital TV screen and camera', TRUE),
(3, 'Pegasus (Huddle Room)', 'MEETING_ROOM', 'Conference Wing, Ground Floor', 8, 'Huddle room with camera and speakerphone', TRUE),
(4, 'Atlas (Huddle Room)', 'MEETING_ROOM', 'First Floor, East Wing', 4, 'Small discussion room for private calls', TRUE),
(5, 'Mercury (Huddle Room)', 'MEETING_ROOM', 'First Floor, West Wing', 4, 'Small discussion room for private calls', TRUE),
(6, 'Neptune (Boardroom)', 'MEETING_ROOM', 'Second Floor, Conference Wing', 20, 'Premium executive room with smart TV', TRUE),
(7, 'Epson EB-2250U Projector 1', 'PROJECTOR', 'IT Storage', NULL, 'Portable high-definition projector', TRUE),
(8, 'BenQ LH720 Projector 2', 'PROJECTOR', 'IT Storage', NULL, 'Premium laser conference projector', TRUE),
(9, 'Company Sedan - Toyota', 'VEHICLE', 'Parking Garage Level B1', 5, 'Toyota Camry Hybrid (Silver) for local client meetings', TRUE),
(10, 'Jabra Speak 750 Kit', 'EQUIPMENT', 'IT Storage', NULL, 'Portable speakerphone conferencing set', TRUE);

ALTER SEQUENCE bookable_resources_id_seq RESTART WITH 11;

-- 7. SEED BOOKINGS (10 Bookings)
-- Statuses: UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED
-- Booked By Users: Rahul Menon (5), Priya Sharma (2), Sneha Iyer (3), etc.
-- Today's date is July 12, 2026.
INSERT INTO bookings (id, resource_id, booked_by_user_id, title, description, start_datetime, end_datetime, status, notes, reminder_sent) VALUES
(1, 1, 5, 'Orion Room - Daily Standup', 'Engineering daily standup sync', '2026-07-12 09:00:00+05:30', '2026-07-12 10:00:00+05:30', 'COMPLETED', 'Discuss sprint items and blockers', TRUE),
(2, 7, 2, 'Projector - External Client Demo', 'Presentation for corporate clients', '2026-07-12 14:00:00+05:30', '2026-07-12 16:00:00+05:30', 'UPCOMING', 'Collect from IT room beforehand', FALSE),
(3, 2, 3, 'Phoenix - HR Recruitment Sync', 'Review resumes for Senior Developer role', '2026-07-12 11:00:00+05:30', '2026-07-12 12:00:00+05:30', 'COMPLETED', 'Interview notes should be added to ATS', TRUE),
(4, 9, 7, 'Company Sedan - Sales Meeting', 'Visit client site in technology park', '2026-07-13 10:00:00+05:30', '2026-07-13 14:00:00+05:30', 'UPCOMING', 'Return with full tank fuel', FALSE),
(5, 3, 6, 'Pegasus - Product Roadmap Review', 'Q3 roadmap brainstorming session', '2026-07-12 15:00:00+05:30', '2026-07-12 16:30:00+05:30', 'UPCOMING', 'Invite designers and managers', FALSE),
(6, 1, 12, 'Orion - Engineering Architecture Board', 'Deep dive into microservices migration', '2026-07-12 13:00:00+05:30', '2026-07-12 14:30:00+05:30', 'IN_PROGRESS', 'Bring architecture schematics', FALSE),
(7, 4, 11, 'Atlas - CS Onboarding Session', 'Client orientation training call', '2026-07-12 10:00:00+05:30', '2026-07-12 11:00:00+05:30', 'COMPLETED', 'Orientation slides shared', TRUE),
(8, 10, 8, 'Jabra Speakerphone - RND Brainstorm', 'Collaborative session with remote research labs', '2026-07-12 16:00:00+05:30', '2026-07-12 18:00:00+05:30', 'UPCOMING', 'Verify battery levels', FALSE),
(9, 6, 9, 'Neptune - Finance Q2 Board Meeting', 'Financial audits review', '2026-07-14 09:00:00+05:30', '2026-07-14 12:00:00+05:30', 'UPCOMING', 'Board members attending in person', FALSE),
(10, 5, 20, 'Mercury - CS Strategy Session', 'Monthly metrics evaluation and renewal strategy', '2026-07-12 14:00:00+05:30', '2026-07-12 15:00:00+05:30', 'UPCOMING', 'Bring slide deck', FALSE);

ALTER SEQUENCE bookings_id_seq RESTART WITH 11;

-- 8. SEED MAINTENANCE REQUESTS (10 Records)
-- Priorities: LOW, MEDIUM, HIGH, CRITICAL
-- Statuses: PENDING, APPROVED, ASSIGNED, IN_PROGRESS, RESOLVED, CANCELLED
-- Users: Admin (1), Priya (2), Technicians (e.g. System Administrator - 1)
INSERT INTO maintenance_requests (id, asset_id, requested_by_user_id, assigned_technician_id, approved_by_user_id, priority, status, title, description, resolution_notes, scheduled_date, completed_date, estimated_cost, actual_cost) VALUES
(1, 3, 5, 1, 1, 'HIGH', 'IN_PROGRESS', 'Lenovo ThinkPad X1 Carbon - Battery draining rapidly', 'Laptop battery drops from 100% to 20% within 45 minutes of usage.', NULL, '2026-07-11', NULL, 150.00, NULL),
(2, 20, 5, 26, 1, 'MEDIUM', 'RESOLVED', 'LG 27" Monitor - Dead Pixels', 'Spotted a cluster of 5 dead pixels on the upper left quadrant.', 'Replaced LCD panel under manufacturer warranty.', '2026-07-05', '2026-07-08 14:30:00+05:30', 0.00, 0.00),
(3, 87, 1, 26, 1, 'HIGH', 'RESOLVED', 'Ford Transit Van - Brake Pads Replacement', 'Squeaking noises coming from front wheels when braking.', 'Installed new OEM front brake pads and sensors.', '2026-07-01', '2026-07-03 16:00:00+05:30', 250.00, 275.00),
(4, 76, 26, 26, 1, 'MEDIUM', 'PENDING', 'HP LaserJet Printer - Paper Jamming', 'Printer repeatedly jams at tray 2 roller feed.', NULL, NULL, NULL, 50.00, NULL),
(5, 60, 27, 26, 1, 'HIGH', 'RESOLVED', 'Cisco Switch - Overheating & Fan Issue', 'Fan unit #2 is emitting grinding noise and port lights flashing warning.', 'Cleaned chassis and replaced faulty 40mm fan unit.', '2026-06-20', '2026-06-21 11:30:00+05:30', 80.00, 75.00),
(6, 13, 14, 1, 1, 'MEDIUM', 'ASSIGNED', 'Lenovo ThinkPad X1 - Keyboard Keys Sticking', 'Spacebar and E key are unresponsive or stick.', NULL, '2026-07-13', NULL, 60.00, NULL),
(7, 2, 2, NULL, NULL, 'LOW', 'PENDING', 'Apple MacBook Pro - Minor screen coating peel', 'Small patch of anti-reflective coating wearing off on edge.', NULL, NULL, NULL, 0.00, NULL),
(8, 77, 4, 26, 1, 'MEDIUM', 'RESOLVED', 'Brother Printer - Toner Replacement & Roller Clean', 'Faint streaks visible on print pages.', 'Installed high-yield black toner cartridge and cleaned rollers.', '2026-07-06', '2026-07-07 10:15:00+05:30', 120.00, 120.00),
(9, 66, 1, 26, 1, 'MEDIUM', 'IN_PROGRESS', 'Epson Projector - Lamp replacement warning', 'System message indicating laser lamp life at 5% hours remaining.', NULL, '2026-07-12', NULL, 180.00, NULL),
(10, 84, 1, NULL, 1, 'CRITICAL', 'RESOLVED', 'Brother Printer - Motherboard Fried', 'Printer unit completely dead after voltage spike in office.', 'Device declared unrepairable. Disposed and written off.', '2026-05-15', '2026-05-18 16:30:00+05:30', 400.00, 0.00);

ALTER SEQUENCE maintenance_requests_id_seq RESTART WITH 11;

-- 9. SEED TRANSFER & APPROVAL REQUESTS (10 Records)
-- Types: MAINTENANCE_REQUEST, ASSET_DISPOSAL, ASSET_TRANSFER, ALLOCATION_REQUEST, AUDIT_CLOSE
-- Statuses: PENDING, APPROVED, REJECTED
INSERT INTO approval_requests (id, type, entity_id, entity_type, requested_by_user_id, approved_by_user_id, status, title, description, notes, resolution_notes, resolved_at) VALUES
(1, 'ASSET_TRANSFER', 8, 'Asset', 5, 2, 'PENDING', 'Transfer Request: Lenovo ThinkPad X1 Carbon (AF-0008)', 'Transfer laptop from Rahul Menon to Akash Verma.', 'Requested due to shift in project assignments to PM group.', NULL, NULL),
(2, 'MAINTENANCE_REQUEST', 1, 'MaintenanceRequest', 5, 1, 'APPROVED', 'Approve Maintenance: Lenovo ThinkPad X1 Battery Replacement', 'High priority battery replacement for employee workflow continuity.', 'Approved immediate service.', 'Assigned to IT Admin.', '2026-07-11 11:30:00+05:30'),
(3, 'ASSET_TRANSFER', 4, 'Asset', 7, 2, 'APPROVED', 'Transfer Request: HP EliteBook 840 (AF-0004)', 'Transfer laptop from Neha Gupta to Kunal Shah.', 'Approved.', 'Re-assigned to Kunal Shah in system.', '2026-07-02 15:00:00+05:30'),
(4, 'ALLOCATION_REQUEST', 2, 'Asset', 11, 2, 'PENDING', 'Allocation Request: MacBook Pro M3 (AF-0002)', 'Request allocation of available MacBook for Ananya Rao.', 'Requires designer grade hardware.', NULL, NULL),
(5, 'ASSET_DISPOSAL', 84, 'Asset', 1, 2, 'APPROVED', 'Asset Disposal Approval: Brother Printer (AF-0084)', 'Write-off completely damaged printer unit post electrical spike.', 'Eco-waste disposal scheduled.', 'Approved and scrapped.', '2026-05-18 16:00:00+05:30'),
(6, 'ASSET_TRANSFER', 15, 'Asset', 16, 2, 'REJECTED', 'Transfer Request: MacBook Air M2 (AF-0015)', 'Transfer device to external marketing consultant.', 'Security policy does not allow non-employee access to corporate assets.', 'Denied.', '2026-06-10 14:00:00+05:30'),
(7, 'ALLOCATION_REQUEST', 19, 'Asset', 26, 2, 'APPROVED', 'Allocation Request: Dell 27" Monitor (AF-0019)', 'Assign secondary monitor to Vijay Sharma.', 'Needed for QA multi-window testing.', 'Assigned.', '2026-07-05 10:00:00+05:30'),
(8, 'MAINTENANCE_REQUEST', 10, 'MaintenanceRequest', 1, 1, 'APPROVED', 'Approve Write-off: Brother Printer repair request', 'Approve write off recommendation for blown motherboard.', 'Proceed with asset disposal.', 'Approved.', '2026-05-15 11:00:00+05:30'),
(9, 'ASSET_TRANSFER', 31, 'Asset', 4, 2, 'PENDING', 'Transfer Request: Logitech MX Keys S (AF-0031)', 'Transfer keyboard from Arjun Kumar to Ananya Rao.', 'Arjun has moved to ergonomic keychron set.', NULL, NULL),
(10, 'AUDIT_CLOSE', 1, 'AuditCycle', 3, 2, 'PENDING', 'Approve Close: Q3 IT Infrastructure Audit', 'Requesting closure of audit cycle with 95% verification completion.', 'Approved reports compiled.', NULL, NULL);

ALTER SEQUENCE approval_requests_id_seq RESTART WITH 11;

-- 10. SEED NOTIFICATIONS (20 Notifications)
-- Types: ASSET_ALLOCATED, ASSET_RETURNED, MAINTENANCE_REQUESTED, MAINTENANCE_RESOLVED, BOOKING_CONFIRMED, BOOKING_REMINDER, BOOKING_CANCELLED, WARRANTY_EXPIRING, AUDIT_ASSIGNED, APPROVAL_REQUIRED, APPROVAL_RESOLVED, OVERDUE_RETURN, GENERAL
INSERT INTO notifications (id, user_id, title, message, type, is_read, entity_type, entity_id, read_at) VALUES
(1, 1, 'Maintenance Approved', 'Laptop AF-0003 maintenance request has been approved by Admin.', 'APPROVAL_RESOLVED', FALSE, 'MaintenanceRequest', 1, NULL),
(2, 5, 'Booking Confirmed', 'Meeting Room Orion booked successfully for July 12, 9 AM.', 'BOOKING_CONFIRMED', TRUE, 'Booking', 1, '2026-07-12 09:05:00+05:30'),
(3, 2, 'Transfer Request Pending', 'Transfer request created for Laptop AF-0008 from Rahul Menon to Akash Verma.', 'APPROVAL_REQUIRED', FALSE, 'ApprovalRequest', 1, NULL),
(4, 6, 'Warranty Alert', 'MacBook Pro M2 (AF-0011) warranty expires in 5 Days.', 'WARRANTY_EXPIRING', FALSE, 'Asset', 11, NULL),
(5, 18, 'Asset Overdue Return', 'Access badge and monitor AF-0029 are overdue for return.', 'OVERDUE_RETURN', FALSE, 'Allocation', 19, NULL),
(6, 3, 'Audit Assigned', 'You have been assigned as the lead auditor for the Q3 IT Infrastructure Audit.', 'AUDIT_ASSIGNED', TRUE, 'AuditCycle', 1, '2026-07-12 11:20:00+05:30'),
(7, 4, 'Asset Allocated', 'Dell Latitude 7440 (AF-0001) has been successfully allocated to you.', 'ASSET_ALLOCATED', TRUE, 'Allocation', 1, '2026-01-10 10:00:00+05:30'),
(8, 7, 'Asset Allocated', 'HP EliteBook 840 (AF-0004) has been allocated to you.', 'ASSET_ALLOCATED', TRUE, 'Allocation', 2, '2026-02-05 11:00:00+05:30'),
(9, 10, 'Asset Allocated', 'MacBook Air M3 (AF-0005) has been allocated to you.', 'ASSET_ALLOCATED', TRUE, 'Allocation', 3, '2026-03-10 12:00:00+05:30'),
(10, 5, 'Maintenance Resolved', 'LG 27" Monitor (AF-0020) maintenance completed successfully.', 'MAINTENANCE_RESOLVED', FALSE, 'MaintenanceRequest', 2, NULL),
(11, 24, 'Asset Allocated', 'Dell Precision 5680 (AF-0006) has been allocated to you.', 'ASSET_ALLOCATED', TRUE, 'Allocation', 4, '2026-01-20 15:00:00+05:30'),
(12, 11, 'Asset Allocated', 'ThinkPad T14 (AF-0007) has been allocated to you.', 'ASSET_ALLOCATED', TRUE, 'Allocation', 5, '2023-06-15 10:00:00+05:30'),
(13, 2, 'New Maintenance Request', 'A new maintenance request has been submitted for Dell Projector AF-0066.', 'MAINTENANCE_REQUESTED', FALSE, 'MaintenanceRequest', 9, NULL),
(14, 5, 'Booking Reminder', 'Reminder: Meeting Room Orion daily standup starts in 15 minutes.', 'BOOKING_REMINDER', TRUE, 'Booking', 1, '2026-07-12 08:45:00+05:30'),
(15, 3, 'Transfer Request Approved', 'Transfer request for HP EliteBook AF-0004 approved.', 'APPROVAL_RESOLVED', TRUE, 'ApprovalRequest', 3, '2026-07-02 15:10:00+05:30'),
(16, 2, 'Warranty Alert', 'Cisco Catalyst Switch (AF-0060) warranty has expired.', 'WARRANTY_EXPIRING', FALSE, 'Asset', 60, NULL),
(17, 2, 'Warranty Alert', 'JetBrains All Products License (AF-0088) expires in 15 Days.', 'WARRANTY_EXPIRING', FALSE, 'Asset', 88, NULL),
(18, 1, 'Database Backup Success', 'Daily database level schema and records backed up successfully.', 'GENERAL', TRUE, NULL, NULL, '2026-07-12 03:00:00+05:30'),
(19, 12, 'New Team Member Onboarding', 'Vikram Singh, your team member Ananya Rao has been allocated her IT kit.', 'GENERAL', TRUE, NULL, NULL, '2023-09-01 11:00:00+05:30'),
(20, 2, 'Audit Report Available', 'Engineering Floor Audit cycle report is generated.', 'GENERAL', FALSE, 'AuditCycle', 1, NULL);

ALTER SEQUENCE notifications_id_seq RESTART WITH 21;

-- 11. SEED ACTIVITY TIMELINE (30 logs)
INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address, user_agent) VALUES
(1, 1, 'CREATE_ASSET', 'Asset', 1, 'Admin registered Dell Latitude 7440 (AF-0001).', '192.168.1.10', 'Mozilla/5.0'),
(2, 2, 'ALLOCATE_ASSET', 'Allocation', 1, 'Laptop AF-0001 allocated to Arjun Kumar.', '192.168.1.15', 'Mozilla/5.0'),
(3, 5, 'BOOK_RESOURCE', 'Booking', 1, 'Meeting Room Orion booked by Rahul Menon for July 12.', '192.168.1.22', 'Mozilla/5.0'),
(4, 1, 'APPROVE_MAINTENANCE', 'ApprovalRequest', 2, 'Maintenance request for AF-0003 approved by Admin.', '192.168.1.10', 'Mozilla/5.0'),
(5, 7, 'CREATE_TRANSFER_REQUEST', 'ApprovalRequest', 3, 'Transfer request created for AF-0004.', '192.168.1.14', 'Mozilla/5.0'),
(6, 1, 'START_AUDIT', 'AuditCycle', 1, 'Audit cycle "Q3 IT Infrastructure Audit" started.', '192.168.1.10', 'Mozilla/5.0'),
(7, 1, 'CREATE_ASSET', 'Asset', 2, 'Admin registered MacBook Pro M3 (AF-0002).', '192.168.1.10', 'Mozilla/5.0'),
(8, 1, 'CREATE_ASSET', 'Asset', 3, 'Admin registered ThinkPad X1 Carbon (AF-0003).', '192.168.1.10', 'Mozilla/5.0'),
(9, 1, 'CREATE_ASSET', 'Asset', 4, 'Admin registered HP EliteBook 840 (AF-0004).', '192.168.1.10', 'Mozilla/5.0'),
(10, 1, 'CREATE_ASSET', 'Asset', 5, 'Admin registered MacBook Air M3 (AF-0005).', '192.168.1.10', 'Mozilla/5.0'),
(11, 2, 'ALLOCATE_ASSET', 'Allocation', 2, 'HP EliteBook 840 (AF-0004) allocated to Neha Gupta.', '192.168.1.15', 'Mozilla/5.0'),
(12, 2, 'ALLOCATE_ASSET', 'Allocation', 3, 'MacBook Air M3 (AF-0005) allocated to Vivek Reddy.', '192.168.1.15', 'Mozilla/5.0'),
(13, 1, 'CREATE_RESOURCE', 'BookableResource', 1, 'Created meeting room Orion.', '192.168.1.10', 'Mozilla/5.0'),
(14, 1, 'CREATE_RESOURCE', 'BookableResource', 2, 'Created meeting room Phoenix.', '192.168.1.10', 'Mozilla/5.0'),
(15, 3, 'CREATE_BOOKING', 'Booking', 3, 'Meeting Room Phoenix booked by Sneha Iyer.', '192.168.1.30', 'Mozilla/5.0'),
(16, 2, 'APPROVE_TRANSFER', 'ApprovalRequest', 3, 'Transfer request for AF-0004 approved by Priya Sharma.', '192.168.1.15', 'Mozilla/5.0'),
(17, 26, 'RESOLVE_MAINTENANCE', 'MaintenanceRequest', 2, 'Dead pixels monitor maintenance resolved by Vijay Sharma.', '192.168.1.55', 'Mozilla/5.0'),
(18, 5, 'CREATE_MAINTENANCE_REQUEST', 'MaintenanceRequest', 1, 'Battery drain maintenance request submitted by Rahul Menon.', '192.168.1.22', 'Mozilla/5.0'),
(19, 1, 'DISPOSE_ASSET', 'Asset', 84, 'Asset AF-0084 written off and marked as DISPOSED.', '192.168.1.10', 'Mozilla/5.0'),
(20, 2, 'REJECT_TRANSFER', 'ApprovalRequest', 6, 'Transfer of AF-0015 to contractor rejected by Priya Sharma.', '192.168.1.15', 'Mozilla/5.0'),
(21, 1, 'UPDATE_ASSET_STATUS', 'Asset', 6, 'Asset AF-0006 status updated to ALLOCATED.', '192.168.1.10', 'Mozilla/5.0'),
(22, 1, 'UPDATE_ASSET_STATUS', 'Asset', 8, 'Asset AF-0008 status updated to ALLOCATED.', '192.168.1.10', 'Mozilla/5.0'),
(23, 2, 'ALLOCATE_ASSET', 'Allocation', 17, 'Dell 27" Monitor (AF-0019) allocated to Vijay Sharma.', '192.168.1.15', 'Mozilla/5.0'),
(24, 8, 'CREATE_BOOKING', 'Booking', 8, 'Jabra Speakerphone booked by Karthik Raj.', '192.168.1.41', 'Mozilla/5.0'),
(25, 9, 'CREATE_BOOKING', 'Booking', 9, 'Neptune board room booked by Divya Nair.', '192.168.1.11', 'Mozilla/5.0'),
(26, 26, 'RESOLVE_MAINTENANCE', 'MaintenanceRequest', 3, 'Van brakes replaced and resolved by Vijay Sharma.', '192.168.1.55', 'Mozilla/5.0'),
(27, 26, 'RESOLVE_MAINTENANCE', 'MaintenanceRequest', 5, 'Switch fan issue resolved by Vijay Sharma.', '192.168.1.55', 'Mozilla/5.0'),
(28, 4, 'RETURN_ASSET', 'Allocation', 18, 'ThinkPad AF-0003 returned by Rahul Menon.', '192.168.1.22', 'Mozilla/5.0'),
(29, 2, 'UPDATE_ASSET_STATUS', 'Asset', 3, 'ThinkPad AF-0003 status updated to MAINTENANCE.', '192.168.1.15', 'Mozilla/5.0'),
(30, 2, 'CREATE_AUDIT_ASSIGNMENT', 'AuditAssignment', 1, 'Audit assignment created for HR Floor.', '192.168.1.15', 'Mozilla/5.0');

ALTER SEQUENCE activity_logs_id_seq RESTART WITH 31;

-- 12. SEED AUDIT CYCLES & ASSIGNMENTS & ITEMS (2-3 Cycles)
-- Cycles
INSERT INTO audit_cycles (id, name, description, status, start_date, end_date, created_by_user_id) VALUES
(1, 'Engineering Floor Audit', 'Bi-annual inventory verification for Engineering Department hardware.', 'IN_PROGRESS', '2026-07-15', NULL, 1),
(2, 'Q3 IT Infrastructure Audit', 'Verification of network switches, access points, and rack servers.', 'PLANNED', '2026-08-01', NULL, 1),
(3, 'Corporate Fleet Vehicles Check', 'Annual registration and safety verification of company transport fleet.', 'COMPLETED', '2026-06-01', '2026-06-05', 1);

ALTER SEQUENCE audit_cycles_id_seq RESTART WITH 4;

-- Assignments
INSERT INTO audit_assignments (id, audit_cycle_id, auditor_user_id, department_id, location, notes) VALUES
(1, 1, 3, 2, 'Engineering Bay', 'Verify all laptops, monitors, and keyboard sets currently allocated to dev team.'),
(2, 2, 27, 5, 'Server Room', 'Validate serial numbers on all Catalyst switches and PowerEdge units.'),
(3, 3, 1, 1, 'Parking Garage B1', 'Verify vehicle registrations and insurance details.');

ALTER SEQUENCE audit_assignments_id_seq RESTART WITH 4;

-- Items
-- Statuses: PENDING, VERIFIED, MISSING, DAMAGED
-- Conditions: EXCELLENT, GOOD, FAIR, POOR, DAMAGED
INSERT INTO audit_items (id, audit_assignment_id, asset_id, status, condition, notes, verified_by_user_id, verified_at) VALUES
(1, 1, 1, 'VERIFIED', 'EXCELLENT', 'Matching serial number, pristine condition.', 3, '2026-07-12 11:30:00+05:30'),
(2, 1, 7, 'VERIFIED', 'GOOD', 'Active and operational.', 3, '2026-07-12 11:35:00+05:30'),
(3, 1, 16, 'VERIFIED', 'EXCELLENT', 'Connected to developer workstation.', 3, '2026-07-12 11:40:00+05:30'),
(4, 1, 17, 'DAMAGED', 'DAMAGED', 'Minor screen flicker noticed during check.', 3, '2026-07-12 11:45:00+05:30'),
(5, 1, 31, 'VERIFIED', 'EXCELLENT', 'In use.', 3, '2026-07-12 11:50:00+05:30'),
(6, 1, 32, 'MISSING', 'POOR', 'Employee claims mouse lost during floor transition.', 3, '2026-07-12 11:55:00+05:30'),
(7, 3, 86, 'VERIFIED', 'EXCELLENT', 'Sedan clean and logs verified.', 1, '2026-06-02 10:00:00+05:30'),
(8, 3, 87, 'VERIFIED', 'GOOD', 'Van inspection completed.', 1, '2026-06-02 10:15:00+05:30');

ALTER SEQUENCE audit_items_id_seq RESTART WITH 9;
