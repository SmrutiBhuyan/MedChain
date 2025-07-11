# PostgreSQL Setup Guide for MedChain

## Current Status (Replit Environment)

Your MedChain project is already running PostgreSQL successfully:
- Database connection: Active and working
- Tables: 5 tables created (users, drugs, pharmacies, inventory, verifications)
- Sample data: Populated with test records
- Environment variables: Automatically configured

## Environment Variables (Already Set)

```env
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your-postgresql-host
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=medchain
```

## Verify Current Setup

```bash
# Check if PostgreSQL is running
psql $DATABASE_URL -c "SELECT version();"

# View all tables
psql $DATABASE_URL -c "\dt"

# Check sample data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM drugs;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pharmacies;"
```

## Local PostgreSQL Installation

### Windows Installation

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer (recommended: PostgreSQL 15 or later)

2. **Run the Installer**
   ```
   - Choose installation directory (default: C:\Program Files\PostgreSQL\15)
   - Set password for postgres user (remember this!)
   - Choose port (default: 5432)
   - Select locale (default: English)
   ```

3. **Add PostgreSQL to PATH**
   ```cmd
   # Add to system PATH:
   C:\Program Files\PostgreSQL\15\bin
   ```

4. **Test Installation**
   ```cmd
   # Open Command Prompt
   psql -U postgres -h localhost
   # Enter password when prompted
   ```

### macOS Installation

1. **Using Homebrew** (Recommended)
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Install PostgreSQL
   brew install postgresql@15

   # Start PostgreSQL service
   brew services start postgresql@15
   ```

2. **Using PostgreSQL.app**
   - Download from: https://postgresapp.com/
   - Drag to Applications folder
   - Open PostgreSQL.app
   - Click "Initialize" to create first database

3. **Test Installation**
   ```bash
   # Connect to database
   psql postgres
   ```

### Linux Installation

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres
psql
```

#### CentOS/RHEL/Fedora
```bash
# Install PostgreSQL
sudo dnf install postgresql postgresql-server

# Initialize database
sudo postgresql-setup --initdb

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Connect to database
sudo -u postgres psql
```

## Database Setup for MedChain

### 1. Create Database User
```sql
-- Connect as postgres user
psql postgres

-- Create user for MedChain
CREATE USER medchain_user WITH PASSWORD 'secure_password';

-- Create database
CREATE DATABASE medchain OWNER medchain_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE medchain TO medchain_user;

-- Exit
\q
```

### 2. Configure Connection
Create `.env` file in your project root:
```env
DATABASE_URL=postgresql://medchain_user:secure_password@localhost:5432/medchain
PGHOST=localhost
PGPORT=5432
PGUSER=medchain_user
PGPASSWORD=secure_password
PGDATABASE=medchain
```

### 3. Initialize MedChain Schema
```bash
# In your project directory
npm run db:push

# Seed with sample data
npm run db:seed
```

## PostgreSQL Configuration

### 1. Edit postgresql.conf
```bash
# Find configuration file
sudo find /etc -name "postgresql.conf"

# Edit configuration
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Key settings:
```conf
# Connection settings
listen_addresses = 'localhost'
port = 5432
max_connections = 100

# Memory settings
shared_buffers = 128MB
effective_cache_size = 4GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 2. Edit pg_hba.conf
```bash
# Edit authentication file
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Add these lines:
```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             medchain_user                           md5
host    all             medchain_user   127.0.0.1/32            md5
host    all             medchain_user   ::1/128                 md5
```

### 3. Restart PostgreSQL
```bash
sudo systemctl restart postgresql
```

## Database Management

### Basic Commands
```sql
-- Connect to database
psql -U medchain_user -d medchain -h localhost

-- List databases
\l

-- List tables
\dt

-- Describe table structure
\d table_name

-- View table data
SELECT * FROM users LIMIT 5;

-- Exit
\q
```

### Backup and Restore
```bash
# Create backup
pg_dump -U medchain_user -h localhost medchain > medchain_backup.sql

# Restore from backup
psql -U medchain_user -h localhost medchain < medchain_backup.sql

# Create compressed backup
pg_dump -U medchain_user -h localhost -Fc medchain > medchain_backup.dump

# Restore from compressed backup
pg_restore -U medchain_user -h localhost -d medchain medchain_backup.dump
```

## Performance Optimization

### 1. Create Indexes
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_drugs_batch_number ON drugs(batch_number);
CREATE INDEX idx_inventory_drug_id ON inventory(drug_id);
CREATE INDEX idx_inventory_pharmacy_id ON inventory(pharmacy_id);
CREATE INDEX idx_pharmacies_city ON pharmacies(city);
CREATE INDEX idx_verifications_drug_id ON verifications(drug_id);
```

### 2. Analyze Tables
```sql
-- Update table statistics
ANALYZE;

-- Analyze specific table
ANALYZE drugs;
```

### 3. Monitor Performance
```sql
-- View slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- View table statistics
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables;
```

## Security Best Practices

### 1. User Management
```sql
-- Create read-only user
CREATE USER medchain_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE medchain TO medchain_readonly;
GRANT USAGE ON SCHEMA public TO medchain_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO medchain_readonly;

-- Create application user with limited privileges
CREATE USER medchain_app WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE medchain TO medchain_app;
GRANT USAGE ON SCHEMA public TO medchain_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO medchain_app;
```

### 2. Connection Security
```conf
# In postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

# In pg_hba.conf
hostssl all all 0.0.0.0/0 md5
```

### 3. Password Policies
```sql
-- Set password requirements
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
SELECT pg_reload_conf();
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check listening ports
sudo netstat -tlnp | grep 5432

# Check configuration
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### 2. Authentication Failed
```bash
# Reset postgres password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'newpassword';"

# Check pg_hba.conf
sudo cat /etc/postgresql/15/main/pg_hba.conf
```

#### 3. Database Does Not Exist
```sql
-- Create database
CREATE DATABASE medchain;

-- Or restore from backup
createdb medchain
psql medchain < backup.sql
```

#### 4. Permission Denied
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE medchain TO medchain_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medchain_user;
```

## GUI Tools

### 1. pgAdmin
- Download: https://www.pgadmin.org/
- Web-based administration interface
- Full database management capabilities

### 2. DBeaver
- Download: https://dbeaver.io/
- Cross-platform database tool
- Free community edition available

### 3. TablePlus
- Download: https://tableplus.com/
- Modern database management tool
- Clean interface and fast performance

## Environment-Specific Setup

### Development
```env
DATABASE_URL=postgresql://medchain_user:dev_password@localhost:5432/medchain_dev
NODE_ENV=development
```

### Testing
```env
DATABASE_URL=postgresql://medchain_user:test_password@localhost:5432/medchain_test
NODE_ENV=test
```

### Production
```env
DATABASE_URL=postgresql://medchain_user:prod_password@prod-host:5432/medchain_prod
NODE_ENV=production
```

## Monitoring and Maintenance

### 1. Regular Maintenance
```sql
-- Vacuum tables
VACUUM ANALYZE;

-- Reindex if needed
REINDEX DATABASE medchain;
```

### 2. Log Analysis
```bash
# Monitor PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Check error logs
sudo grep "ERROR" /var/log/postgresql/postgresql-15-main.log
```

### 3. Backup Strategy
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U medchain_user -h localhost medchain > /backups/medchain_$DATE.sql
find /backups -name "medchain_*.sql" -mtime +7 -delete
```

## Integration with MedChain

Your MedChain application automatically:
- Connects to PostgreSQL using environment variables
- Creates tables using Drizzle ORM migrations
- Seeds sample data for testing
- Handles connection pooling and error recovery

The system is production-ready and scales well with PostgreSQL's robust features.