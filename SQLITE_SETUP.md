# SQLite Setup Guide for MedChain

## ✅ Current Status

Your MedChain system is now running on SQLite with a complete database setup:

- **Database File**: `medchain.db` (automatically created)
- **Tables**: 5 tables with complete schema
- **Sample Data**: Production-ready test data
- **Status**: Fully operational and ready to use

## 📊 Database Structure

### Tables Created
- **users**: User accounts with roles (admin, pharmacy, patient)
- **drugs**: Medicine catalog with batch tracking
- **pharmacies**: Pharmacy locations with GPS coordinates
- **inventory**: Real-time stock tracking
- **verifications**: Drug authentication audit trail

### Sample Data Populated
- **3 Users**: admin@medchain.com, pharmacy@medchain.com, patient@medchain.com
- **5 Drugs**: Paracetamol, Aspirin, Amoxicillin, Ibuprofen, Metformin
- **5 Pharmacies**: Across Mumbai, Delhi, Bangalore, Chennai
- **20 Inventory Records**: Complete stock distribution
- **3 Verifications**: Sample authentication logs

## 🔧 Database Management

### View Database Contents
```bash
# Check database file exists
ls -la medchain.db

# Connect to database
sqlite3 medchain.db

# View all tables
.tables

# Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM drugs;
SELECT COUNT(*) FROM pharmacies;
SELECT COUNT(*) FROM inventory;
SELECT COUNT(*) FROM verifications;

# Exit SQLite
.quit
```

### Backup Database
```bash
# Create backup
cp medchain.db medchain_backup.db

# Or create SQL dump
sqlite3 medchain.db .dump > medchain_backup.sql
```

### Restore Database
```bash
# Restore from backup file
cp medchain_backup.db medchain.db

# Or restore from SQL dump
sqlite3 medchain.db < medchain_backup.sql
```

## 🚀 API Testing

All API endpoints are working with SQLite:

### Test Drug Verification
```bash
curl "http://localhost:5000/api/drugs" | jq
```

### Test Pharmacy Search
```bash
curl "http://localhost:5000/api/pharmacies" | jq
```

### Test Emergency Locator
```bash
curl "http://localhost:5000/api/emergency-locator?drugName=Paracetamol&city=Mumbai" | jq
```

## 🎯 Test Credentials

All accounts use password: `password`

- **Admin**: admin@medchain.com
- **Pharmacy**: pharmacy@medchain.com  
- **Patient**: patient@medchain.com

## 📝 Test Batch Numbers

- **Paracetamol**: MED-2024-001
- **Aspirin**: ASP-2024-045
- **Amoxicillin**: AMX-2024-078
- **Ibuprofen**: IBU-2024-123
- **Metformin**: MET-2024-456

## 🔍 Database Schema Details

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### Drugs Table
```sql
CREATE TABLE drugs (
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
```

### Pharmacies Table
```sql
CREATE TABLE pharmacies (
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
```

### Inventory Table
```sql
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pharmacy_id INTEGER REFERENCES pharmacies(id) NOT NULL,
    drug_id INTEGER REFERENCES drugs(id) NOT NULL,
    quantity INTEGER NOT NULL,
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### Verifications Table
```sql
CREATE TABLE verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_id INTEGER REFERENCES drugs(id) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    location TEXT,
    result TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

## 🛠️ Troubleshooting

### Database Not Found
```bash
# Check if database file exists
ls -la medchain.db

# If missing, restart the application to recreate
npm run dev
```

### Empty Database
```bash
# Check table contents
sqlite3 medchain.db "SELECT COUNT(*) FROM users;"

# If empty, restart application to reseed
npm run dev
```

### Permission Issues
```bash
# Check file permissions
ls -la medchain.db

# Fix permissions if needed
chmod 644 medchain.db
```

## 📈 Advantages of SQLite

### Development Benefits
- **Zero Configuration**: No database server setup required
- **Portable**: Single file database that's easy to backup/restore
- **Fast**: Excellent performance for development and testing
- **Reliable**: ACID compliant with strong data integrity

### Production Considerations
- **Suitable for**: Small to medium applications
- **Limitations**: Single writer, no network access
- **Best for**: Development, testing, embedded applications

## 🔄 Migration Notes

### From PostgreSQL to SQLite
- **Schema**: Successfully converted all PostgreSQL tables to SQLite
- **Data Types**: Proper type mapping (timestamp → text, boolean → integer)
- **Primary Keys**: Changed from `generatedAlwaysAsIdentity()` to `AUTOINCREMENT`
- **Foreign Keys**: Maintained all referential integrity constraints

### Benefits of Migration
- **Simplified Setup**: No external database server required
- **Easier Development**: Instant database file creation
- **Better Portability**: Single file database easy to share
- **Reduced Complexity**: No connection strings or credentials needed

## 🎉 Success Confirmation

Your SQLite migration is complete when:
- ✅ Server starts with "SQLite database connected successfully"
- ✅ API endpoints return data (not empty arrays)
- ✅ medchain.db file exists in project root
- ✅ Login works with test credentials
- ✅ Maps display pharmacy locations
- ✅ Emergency locator finds medicines in stock

## 📞 Support

If you encounter any SQLite-related issues:
1. Check if medchain.db file exists
2. Verify table structure with `.tables` command
3. Confirm data exists with SELECT COUNT(*) queries
4. Restart application to trigger automatic recreation
5. Check console logs for database connection messages

Your MedChain system is now running on SQLite with full functionality!