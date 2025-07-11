# MedChain - Quick Start Guide for Localhost

## 🚀 Ultra-Fast Setup (5 Minutes)

You mentioned you have Node.js, Express, and PostgreSQL. Here's the fastest way to get MedChain running:

### Step 1: Extract and Navigate
```bash
# Extract your downloaded zip file
unzip medchain-project.zip
cd medchain-project

# Make scripts executable (Linux/Mac)
chmod +x package-install.sh
chmod +x check-database.js
```

### Step 2: Install Dependencies  
```bash
# Install core dependencies first
npm install

# Install blockchain, AI, ML packages (optional for basic functionality)
bash package-install.sh
```

### Step 3: Setup PostgreSQL Database
```bash
# Database is automatically configured via environment variables
# DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

# Create and populate database
npm run db:push
npm run db:seed

# Verify database setup
node check-database.js
```

### Step 4: Start Application
```bash
# Start the development server
npm run dev
```

### Step 5: Access Application
Open your browser and visit:
- **Main App**: http://localhost:5000
- **Drug Verification**: http://localhost:5000/verify-drug
- **Emergency Locator**: http://localhost:5000/emergency-locator

## 🎯 Essential Commands You Need

### Database Management
```bash
# Check if PostgreSQL database is working
psql $DATABASE_URL -c "SELECT version();"

# View database with detailed info
node check-database.js

# Reset database if needed
npm run db:push && npm run db:seed
```

### Application Testing
```bash
# Test drug verification
curl "http://localhost:5000/api/drugs"

# Test pharmacy search  
curl "http://localhost:5000/api/pharmacies"

# Test emergency locator with ACO algorithm
curl "http://localhost:5000/api/emergency-locator?drugName=Aspirin&city=Mumbai"
```

## 📦 Required Packages for Advanced Features

You have Node.js, Express, and PostgreSQL. For the advanced features, install these additional packages:

### Blockchain Features
```bash
npm install web3 ethers crypto-js
```

### AI/ML Features  
```bash
npm install @tensorflow/tfjs brain.js natural
```

### IoT Monitoring
```bash
npm install mqtt socket.io ws
```

### Voice/IVR System
```bash
npm install @google-cloud/speech twilio
```

### Payment/Incentives
```bash
npm install razorpay stripe upi-payment-gateway
```

## 🔍 Database Verification Methods

### Method 1: Quick Check Script
```bash
node check-database.js
```
This will show you:
- ✅ Database file exists
- ✅ Tables are created
- ✅ Sample data is present
- ✅ Relationships work correctly

### Method 2: Manual Database Check
```bash
# Connect to PostgreSQL database
psql $DATABASE_URL

# Check tables
\dt

# View sample data
SELECT * FROM users;
SELECT * FROM drugs LIMIT 5;
SELECT * FROM pharmacies LIMIT 3;

# Check relationships
SELECT d.name, p.name as pharmacy, i.quantity 
FROM inventory i 
JOIN drugs d ON i.id = d.id 
JOIN pharmacies p ON i.id = p.id;

# Exit
\q
```

### Method 3: Database Browser (Visual)
1. Download pgAdmin: https://www.pgadmin.org/
2. Connect using your PostgreSQL credentials
3. Browse all tables visually

## ✅ Success Indicators

Your setup is working correctly if you see:

### Database Status
- ✅ PostgreSQL database connection established
- ✅ 5 main tables: users, drugs, pharmacies, inventory, verifications
- ✅ Sample data in each table (3+ records)
- ✅ Foreign key relationships working
- ✅ No SQLite native binding issues

### Application Status
- ✅ Server starts on http://localhost:5000
- ✅ Landing page loads without errors
- ✅ Drug verification page works
- ✅ Emergency locator shows results
- ✅ Login/registration functions

### API Status
- ✅ /api/drugs returns drug list
- ✅ /api/pharmacies returns pharmacy list  
- ✅ /api/inventory/search returns results
- ✅ No 500 errors in console

## 🔧 Common Issues & Solutions

### Issue: "Database connection error"
```bash
# Solution:
psql $DATABASE_URL -c "SELECT version();"
npm run db:push
npm run db:seed
```

### Issue: "Port 5000 already in use"
```bash
# Solution:
PORT=3000 npm run dev
# Or kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Issue: "npm install fails"
```bash
# Solution:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Empty database tables"
```bash
# Solution:
tsx server/seed.ts
# Or
npm run db:seed
```

## 🎯 Testing Core Features

### 1. Drug Verification
- Go to: http://localhost:5000/verify-drug
- Test batch number: ASP001, IBU001, PAR001
- Should show verification results

### 2. Emergency Stock Locator
- Go to: http://localhost:5000/emergency-locator  
- Search: "Aspirin" in "Mumbai"
- Should show nearby pharmacies

### 3. Admin Features
- Login with: admin@medchain.com / password
- Access admin dashboard
- Add/edit drugs and inventory
- View PostgreSQL database statistics

### 4. Advanced Features
- Blockchain Tracker: http://localhost:5000/blockchain-tracker
- IoT Monitoring: http://localhost:5000/iot-monitoring
- AI Forecasting: http://localhost:5000/ai-forecasting
- IVR System: http://localhost:5000/ivr-system
- Incentives: http://localhost:5000/incentive-system
- Interactive Maps: Emergency Locator with Ola Maps + OpenStreetMap fallback

## 📊 Expected Database Content

After running the seed script, you should see:

### Users (3 records)
- admin@medchain.com (admin role)
- pharmacy@medchain.com (pharmacy role)  
- patient@medchain.com (patient role)

### Drugs (3 records)
- Paracetamol (MED-2024-001)
- Aspirin (ASP-2024-045)
- Amoxicillin (AMX-2024-078)

### Pharmacies (3 records)
- Apollo Pharmacy (Mumbai) - GPS: 19.1136, 72.8697
- MedPlus Pharmacy (Mumbai) - GPS: 19.0596, 72.8295
- HealthMart Pharmacy (Delhi) - GPS: 28.6315, 77.2167

### Inventory (6 records)
- Links between drugs and pharmacies
- Stock quantities for each combination
- Real-time inventory tracking

## 🚀 Next Steps After Setup

1. **Configure API Keys** (for full functionality):
   - OpenAI for AI features
   - Google Cloud for voice services
   - Twilio for SMS/voice
   - Razorpay for payments

2. **Customize Data**:
   - Add your local pharmacies
   - Add region-specific drugs
   - Update inventory levels

3. **Deploy to Production**:
   - Build: `npm run build`
   - Deploy to your preferred hosting platform

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**: Look at the console output for error messages
2. **Verify Database**: Run `npm run db:check`
3. **Restart Server**: Stop (Ctrl+C) and restart (`npm run dev`)
4. **Check Dependencies**: Ensure all packages installed correctly
5. **Browser Console**: Check for JavaScript errors

## 🎯 Minimal vs Full Setup

### Minimal Setup (Basic Features Only)
```bash
npm install
npm run db:push
npm run db:seed  
npm run dev
```

### Full Setup (All Advanced Features)
```bash
npm install
bash package-install.sh  # Installs blockchain, AI, IoT packages
npm run db:push
npm run db:seed
npm run dev
```

Your MedChain application should now be fully functional on localhost! The database contains sample data, and all features are accessible through the web interface.