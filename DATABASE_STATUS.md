# MedChain Database Status and Verification Guide

## Quick Database Check Commands

After setting up your localhost environment, use these commands to verify your database:

### 1. Simple Database Check
```bash
# Check if database file exists and view basic info
node check-database.js
```

### 2. Alternative Database Check Methods

#### Method A: Using SQLite Command Line
```bash
# Install sqlite3 if not already installed
npm install -g sqlite3

# Open database
sqlite3 medchain.db

# List all tables
.tables

# Check users table
SELECT * FROM users;

# Check drugs table  
SELECT * FROM drugs LIMIT 5;

# Check pharmacies table
SELECT * FROM pharmacies LIMIT 5;

# Check inventory with drug names
SELECT i.quantity, d.name as drug_name, p.name as pharmacy_name 
FROM inventory i 
JOIN drugs d ON i.drugId = d.id 
JOIN pharmacies p ON i.pharmacyId = p.id;

# Check verifications
SELECT v.result, d.name as drug_name, v.timestamp 
FROM verifications v 
JOIN drugs d ON v.drugId = d.id 
ORDER BY v.timestamp DESC LIMIT 5;

# Exit sqlite
.quit
```

#### Method B: Using DB Browser for SQLite (GUI)
1. Download from: https://sqlitebrowser.org/
2. Install and open the application
3. Open Database → Select `medchain.db` from your project folder
4. Browse Data tab to see all tables and their contents
5. Execute SQL tab to run custom queries

#### Method C: Using VS Code Extension
1. Install "SQLite Viewer" extension in VS Code
2. Right-click on `medchain.db` file
3. Select "Open Database"
4. Browse tables and data visually

## Expected Database Structure

Your database should contain these tables with sample data:

### Users Table
```sql
-- Expected columns: id, name, email, password, role, createdAt
-- Sample data:
| id | name        | email              | role     |
|----|-------------|--------------------|----------|
| 1  | Admin User  | admin@medchain.com | admin    |
| 2  | Pharmacy 1  | pharmacy@med.com   | pharmacy |
| 3  | John Doe    | john@example.com   | patient  |
```

### Drugs Table
```sql
-- Expected columns: id, name, manufacturer, batchNumber, expiryDate, price, description, qrCode, createdAt
-- Sample data should include drugs like Aspirin, Paracetamol, Ibuprofen
```

### Pharmacies Table
```sql
-- Expected columns: id, name, address, city, phone, email, lat, lng, createdAt
-- Sample data should include multiple pharmacies across different cities
```

### Inventory Table
```sql
-- Expected columns: id, pharmacyId, drugId, quantity, lastUpdated
-- Links pharmacies with drugs and their stock levels
```

### Verifications Table
```sql
-- Expected columns: id, drugId, userId, result, timestamp, location
-- Tracks drug verification attempts and results
```

## Database Health Indicators

### ✅ Healthy Database Signs:
- Database file exists and is readable
- All 5 main tables are present
- Each table contains sample data (at least 3-5 records)
- Foreign key relationships work correctly
- No integrity check errors
- File size is reasonable (> 50KB with sample data)

### ❌ Problem Indicators:
- Database file missing or empty
- Tables don't exist
- Tables exist but are empty
- Foreign key constraint errors
- Integrity check failures
- Extremely small file size (< 10KB)

## Troubleshooting Database Issues

### Issue 1: Database File Not Found
```bash
# Solution: Create and initialize the database
npm run db:push
npm run db:seed
```

### Issue 2: Tables Exist But Are Empty
```bash
# Solution: Seed the database with sample data
tsx server/seed.ts
# OR
node -r esbuild-register server/seed.ts
```

### Issue 3: Foreign Key Errors
```bash
# Check foreign key constraints
sqlite3 medchain.db "PRAGMA foreign_key_check;"

# If errors found, recreate database
rm medchain.db
npm run db:push
npm run db:seed
```

### Issue 4: Corruption or Integrity Issues
```bash
# Check database integrity
sqlite3 medchain.db "PRAGMA integrity_check;"

# If corrupted, restore from backup or recreate
mv medchain.db medchain.db.corrupted
npm run db:push
npm run db:seed
```

## Verification Queries

Run these queries to ensure data is properly connected:

### 1. Check Drug-Pharmacy Relationships
```sql
SELECT 
    d.name as drug_name,
    d.batchNumber,
    p.name as pharmacy_name,
    p.city,
    i.quantity
FROM inventory i
JOIN drugs d ON i.drugId = d.id  
JOIN pharmacies p ON i.pharmacyId = p.id
ORDER BY d.name;
```

### 2. Check User Verification History
```sql
SELECT 
    u.name as user_name,
    d.name as drug_name,
    d.batchNumber,
    v.result,
    v.timestamp
FROM verifications v
JOIN users u ON v.userId = u.id
JOIN drugs d ON v.drugId = d.id
ORDER BY v.timestamp DESC;
```

### 3. Check Stock Levels by City
```sql
SELECT 
    p.city,
    COUNT(DISTINCT p.id) as pharmacy_count,
    COUNT(DISTINCT d.id) as unique_drugs,
    SUM(i.quantity) as total_stock
FROM pharmacies p
JOIN inventory i ON p.id = i.pharmacyId
JOIN drugs d ON i.drugId = d.id
GROUP BY p.city
ORDER BY total_stock DESC;
```

## API Endpoints for Database Verification

You can also verify data through API endpoints:

### 1. Check Server Connection
```bash
curl http://localhost:5000/api/health
```

### 2. Get All Drugs
```bash
curl http://localhost:5000/api/drugs
```

### 3. Get All Pharmacies
```bash
curl http://localhost:5000/api/pharmacies
```

### 4. Search Inventory
```bash
curl "http://localhost:5000/api/inventory/search?drug=Aspirin&city=Mumbai"
```

### 5. Get Statistics
```bash
# You might need to login first to get a token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/stats
```

## Expected Data Volume

After proper seeding, you should see approximately:
- **Users**: 3-5 accounts (admin, pharmacy, patients)
- **Drugs**: 10-15 common medications
- **Pharmacies**: 5-8 pharmacies across different cities
- **Inventory**: 20-30 inventory records (drug-pharmacy combinations)
- **Verifications**: 5-10 sample verification records

## Performance Indicators

### Good Performance:
- Database queries respond within 50ms
- File operations are fast
- No timeout errors
- Smooth API responses

### Performance Issues:
- Slow query responses (>1000ms)
- Database lock errors
- Memory usage spikes
- API timeouts

## Backup and Recovery

### Creating Backups
```bash
# Create backup
cp medchain.db backup/medchain-$(date +%Y%m%d-%H%M%S).db

# Or compress it
tar -czf backup/medchain-backup-$(date +%Y%m%d).tar.gz medchain.db
```

### Restoring from Backup
```bash
# Stop the server first
# Then restore
cp backup/medchain-20240115-120000.db medchain.db

# Restart server
npm run dev
```

## Integration with Application Features

### 1. Drug Verification
- Database should respond to batch number lookups
- QR code data should match database records
- Verification results should be logged

### 2. Emergency Locator  
- Inventory queries should return accurate stock levels
- Pharmacy location data should be complete
- Search results should be relevant and fast

### 3. Admin Dashboard
- Statistics should reflect actual database counts
- CRUD operations should work smoothly
- Data relationships should be maintained

### 4. Blockchain Features
- Transaction logging should work
- Audit trails should be maintained
- Data integrity should be preserved

Your database is the foundation of the MedChain application. Ensuring it's properly set up and contains accurate data is crucial for all features to work correctly.