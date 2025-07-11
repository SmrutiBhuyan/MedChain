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
('Aspirin', 'ASP001', 'PharmaCorp', '2025-12-31', 'Pain Relief', '500mg', 'Pain relief and anti-inflammatory medication'),
('Paracetamol', 'PAR001', 'HealthLabs', '2025-11-30', 'Pain Relief', '500mg', 'Fever reducer and pain reliever'),
('Ibuprofen', 'IBU001', 'MediCore', '2025-10-31', 'Anti-inflammatory', '400mg', 'Non-steroidal anti-inflammatory drug'),
('Amoxicillin', 'AMX001', 'BioPharma', '2025-09-30', 'Antibiotic', '250mg', 'Broad-spectrum antibiotic'),
('Ciprofloxacin', 'CIP001', 'MediLife', '2025-08-31', 'Antibiotic', '500mg', 'Fluoroquinolone antibiotic');

INSERT OR IGNORE INTO pharmacies (name, city, address, contact, lat, lng, user_id) VALUES 
('HealthPlus Pharmacy', 'Mumbai', '123 Main Street, Andheri', '+91-9876543210', 19.1136, 72.8697, 2),
('MediCare Store', 'Delhi', '456 Central Avenue, CP', '+91-9876543211', 28.6139, 77.2090, NULL),
('WellBeing Pharmacy', 'Bangalore', '789 Tech Park Road, Whitefield', '+91-9876543212', 12.9716, 77.5946, NULL),
('City Pharmacy', 'Chennai', '321 Anna Salai, T.Nagar', '+91-9876543213', 13.0827, 80.2707, NULL),
('Metro Medical', 'Pune', '654 FC Road, Shivajinagar', '+91-9876543214', 18.5204, 73.8567, NULL);

INSERT OR IGNORE INTO inventory (pharmacy_id, drug_id, quantity) VALUES 
(1, 1, 50), (1, 2, 75), (1, 3, 30), (1, 4, 25), (1, 5, 40),
(2, 1, 60), (2, 2, 45), (2, 3, 55), (2, 4, 35), (2, 5, 20),
(3, 1, 40), (3, 2, 65), (3, 3, 25), (3, 4, 45), (3, 5, 30),
(4, 1, 35), (4, 2, 55), (4, 3, 40), (4, 4, 20), (4, 5, 50),
(5, 1, 45), (5, 2, 35), (5, 3, 60), (5, 4, 40), (5, 5, 25);

INSERT OR IGNORE INTO verifications (drug_id, user_id, location, result) VALUES 
(1, 3, 'Mumbai', 'genuine'),
(2, 3, 'Delhi', 'genuine'),
(3, 3, 'Bangalore', 'genuine');