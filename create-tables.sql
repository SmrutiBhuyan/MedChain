-- MedChain Database Schema Creation
-- SQLite schema with proper column names matching the Drizzle schema

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS drugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    batch_number TEXT NOT NULL UNIQUE,
    manufacturer TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    category TEXT,
    strength TEXT,
    description TEXT,
    qr_code_url TEXT,
    is_counterfeit INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS pharmacies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    contact TEXT NOT NULL,
    lat REAL,
    lng REAL,
    user_id INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pharmacy_id INTEGER REFERENCES pharmacies(id) NOT NULL,
    drug_id INTEGER REFERENCES drugs(id) NOT NULL,
    quantity INTEGER NOT NULL,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_id INTEGER REFERENCES drugs(id) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    location TEXT,
    result TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert sample data
INSERT OR IGNORE INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@medchain.com', '$2a$10$rJ1QDr9mh9K5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', 'admin'),
('Pharmacy Manager', 'pharmacy@med.com', '$2a$10$rJ1QDr9mh9K5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', 'pharmacy'),
('John Doe', 'john@example.com', '$2a$10$rJ1QDr9mh9K5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', 'patient');

INSERT OR IGNORE INTO drugs (name, batch_number, manufacturer, expiry_date, category, strength, description) VALUES 
('Epinephrine (Adrenaline)', 'EPI001', 'LifeSaver Pharma', '2025-12-31', 'Emergency Medicine', '1mg/mL', 'Critical for anaphylaxis and cardiac arrest - reverses severe allergic reactions'),
('Atropine', 'ATR001', 'CriticalCare Labs', '2025-11-30', 'Antidote', '0.5mg/mL', 'Antidote for organophosphate poisoning and bradycardia emergencies'),
('Naloxone (Narcan)', 'NAL001', 'EmergencyMed Corp', '2025-10-31', 'Antidote', '0.4mg/mL', 'Reverses opioid overdose - can save lives in minutes'),
('Nitroglycerin', 'NIT001', 'CardioSave Pharma', '2025-09-30', 'Cardiac Medicine', '0.3mg', 'Prevents heart attack death by improving blood flow to heart'),
('Insulin (Rapid-Acting)', 'INS001', 'DiabetesLife Inc', '2025-08-31', 'Diabetes Medicine', '100 IU/mL', 'Prevents diabetic coma and death from severe hyperglycemia'),
('Albuterol', 'ALB001', 'RespiratoryAid Ltd', '2025-07-31', 'Bronchodilator', '90mcg', 'Prevents asthma death by opening airways during severe attacks'),
('Morphine', 'MOR001', 'PainRelief Medical', '2025-06-30', 'Pain Management', '10mg/mL', 'Critical for severe trauma pain and end-of-life care'),
('Digoxin', 'DIG001', 'HeartCare Pharmaceuticals', '2025-05-31', 'Cardiac Glycoside', '0.25mg', 'Treats heart failure and dangerous heart rhythm disorders'),
('Warfarin', 'WAR001', 'AntiCoagulant Labs', '2025-04-30', 'Blood Thinner', '5mg', 'Prevents life-threatening blood clots and strokes'),
('Prednisone', 'PRE001', 'InflammaStop Inc', '2025-03-31', 'Corticosteroid', '20mg', 'Treats severe inflammation and autoimmune crises');

INSERT OR IGNORE INTO pharmacies (name, city, address, contact, lat, lng, user_id) VALUES 
('LifeSaver Emergency Pharmacy', 'Mumbai', '24/7 Emergency Wing, Lilavati Hospital, Bandra', '+91-9876543210', 19.0596, 72.8295, 2),
('Critical Care Medical Store', 'Delhi', 'AIIMS Emergency Block, Ansari Nagar', '+91-9876543211', 28.5665, 77.2103, NULL),
('Emergency Medicine Depot', 'Bangalore', 'Manipal Hospital, HAL Airport Road', '+91-9876543212', 12.9698, 77.7500, NULL),
('Apollo Emergency Pharmacy', 'Chennai', 'Apollo Hospital, Greams Road', '+91-9876543213', 13.0596, 80.2454, NULL),
('Urgent Care Medicine Centre', 'Pune', 'Ruby Hall Clinic, Sassoon Road', '+91-9876543214', 18.5314, 73.8446, NULL),
('Trauma Care Pharmacy', 'Hyderabad', 'Nizam Institute of Medical Sciences, Punjagutta', '+91-9876543215', 17.4249, 78.4489, NULL),
('Emergency Drug Depot', 'Kolkata', 'SSKM Hospital, College Street', '+91-9876543216', 22.5868, 88.3643, NULL),
('Cardiac Emergency Store', 'Ahmedabad', 'UN Mehta Heart Institute, Civil Hospital', '+91-9876543217', 23.0301, 72.5477, NULL);

INSERT OR IGNORE INTO inventory (pharmacy_id, drug_id, quantity) VALUES 
-- Mumbai - LifeSaver Emergency Pharmacy
(1, 1, 25), (1, 2, 40), (1, 3, 15), (1, 4, 30), (1, 5, 50), (1, 6, 35), (1, 7, 20), (1, 8, 45), (1, 9, 60), (1, 10, 25),
-- Delhi - Critical Care Medical Store  
(2, 1, 30), (2, 2, 25), (2, 3, 40), (2, 4, 35), (2, 5, 45), (2, 6, 40), (2, 7, 15), (2, 8, 50), (2, 9, 35), (2, 10, 30),
-- Bangalore - Emergency Medicine Depot
(3, 1, 40), (3, 2, 35), (3, 3, 25), (3, 4, 45), (3, 5, 30), (3, 6, 55), (3, 7, 25), (3, 8, 40), (3, 9, 50), (3, 10, 35),
-- Chennai - Apollo Emergency Pharmacy
(4, 1, 35), (4, 2, 50), (4, 3, 20), (4, 4, 40), (4, 5, 35), (4, 6, 30), (4, 7, 40), (4, 8, 25), (4, 9, 45), (4, 10, 50),
-- Pune - Urgent Care Medicine Centre
(5, 1, 45), (5, 2, 30), (5, 3, 35), (5, 4, 25), (5, 5, 40), (5, 6, 45), (5, 7, 30), (5, 8, 35), (5, 9, 40), (5, 10, 20),
-- Hyderabad - Trauma Care Pharmacy
(6, 1, 20), (6, 2, 45), (6, 3, 30), (6, 4, 50), (6, 5, 25), (6, 6, 40), (6, 7, 35), (6, 8, 30), (6, 9, 55), (6, 10, 45),
-- Kolkata - Emergency Drug Depot
(7, 1, 55), (7, 2, 20), (7, 3, 45), (7, 4, 30), (7, 5, 50), (7, 6, 25), (7, 7, 40), (7, 8, 55), (7, 9, 30), (7, 10, 35),
-- Ahmedabad - Cardiac Emergency Store
(8, 1, 30), (8, 2, 55), (8, 3, 40), (8, 4, 60), (8, 5, 35), (8, 6, 50), (8, 7, 25), (8, 8, 45), (8, 9, 25), (8, 10, 40);

INSERT OR IGNORE INTO verifications (drug_id, user_id, location, result) VALUES 
(1, 3, 'Mumbai', 'genuine'),
(2, 3, 'Delhi', 'genuine'),
(3, 3, 'Bangalore', 'genuine'),
(4, 3, 'Chennai', 'genuine'),
(5, 3, 'Pune', 'genuine');