# MedChain - Complete Beginner Setup Guide

## 🎯 What You Need to Do (Simple Steps)

You downloaded the MedChain zip file and want to run it on your computer. Here's exactly what to do:

### Step 1: Extract and Open
```bash
# Extract the zip file you downloaded
unzip medchain-project.zip
cd medchain-project

# Open this folder in your code editor or terminal
```

### Step 2: Install Basic Packages
```bash
# This installs all the basic dependencies
npm install
```

### Step 3: Set Up the Database
```bash
# This creates your database with sample data
node setup-database.js
```

### Step 4: Start the Application
```bash
# This starts your MedChain website
npm run dev
```

### Step 5: Open Your Browser
Go to: **http://localhost:5000**

That's it! Your MedChain application is now running.

---

## 🔍 How to Check if Everything is Working

### Quick Database Check
```bash
# Run this to see your database status
node check-database.js
```

You should see:
- ✅ 3 users (admin, pharmacy, patient)
- ✅ 5 drugs (Aspirin, Paracetamol, etc.)
- ✅ 5 pharmacies across different cities
- ✅ 25 inventory records
- ✅ 3 verification records

### Test the Website
Visit these pages to make sure everything works:

1. **Home Page**: http://localhost:5000
2. **Drug Verification**: http://localhost:5000/verify-drug
   - Try batch number: `ASP001` or `PAR001`
3. **Find Medicine**: http://localhost:5000/emergency-locator
   - Search for: "Aspirin" in "Mumbai"
4. **Login**: http://localhost:5000/login
   - Use: admin@medchain.com / password

---

## 🔧 If Something Goes Wrong

### Problem: "Port 5000 already in use"
```bash
# Kill whatever is using port 5000
pkill -f "tsx server/index.ts"
# Then try again
npm run dev
```

### Problem: "Database error" or empty results
```bash
# Reset and recreate the database
node setup-database.js
# Then restart
npm run dev
```

### Problem: "npm install fails"
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules
npm install
```

### Problem: Website shows errors
1. Stop the server (Ctrl+C)
2. Run: `node setup-database.js`
3. Start again: `npm run dev`

---

## 📦 Adding Advanced Features (Optional)

If you want the advanced features (blockchain, AI, voice, etc.), run this after the basic setup:

```bash
# Install additional packages for advanced features
bash package-install.sh
```

This adds:
- **Blockchain features**: Web3, crypto libraries
- **AI features**: Machine learning, forecasting
- **IoT features**: Sensor monitoring
- **Voice features**: Speech recognition
- **Payment features**: UPI, digital payments

---

## 🎯 What Each File Does

### Important Files You Should Know:
- **medchain.db** - Your database with all the data
- **package.json** - Lists all the software packages needed
- **setup-database.js** - Creates your database with sample data
- **check-database.js** - Shows you what's in your database

### Folders:
- **client/** - The website frontend (what users see)
- **server/** - The backend (handles data and logic)
- **shared/** - Code used by both frontend and backend

---

## 🚀 Using MedChain

### For Patients/Doctors:
1. Go to **Drug Verification** page
2. Enter a batch number (try: ASP001)
3. See if the drug is genuine or counterfeit

### For Finding Medicine:
1. Go to **Emergency Locator** page
2. Type medicine name and city
3. See which pharmacies have it in stock

### For Pharmacy Staff:
1. Login with pharmacy account
2. Manage your inventory
3. Update stock levels

### For Administrators:
1. Login with admin account
2. View system statistics
3. Manage all drugs and pharmacies

---

## 📊 Sample Login Accounts

The database comes with these test accounts:

**Admin Account:**
- Email: admin@medchain.com
- Password: password
- Can: Manage everything

**Pharmacy Account:**
- Email: pharmacy@med.com
- Password: password
- Can: Manage pharmacy inventory

**Patient Account:**
- Email: john@example.com
- Password: password
- Can: Verify drugs, find medicine

---

## 🔍 Database Contents

Your database has sample data including:

### Drugs Available:
- Aspirin (Batch: ASP001)
- Paracetamol (Batch: PAR001)
- Ibuprofen (Batch: IBU001)
- Amoxicillin (Batch: AMX001)
- Ciprofloxacin (Batch: CIP001)

### Cities with Pharmacies:
- Mumbai (HealthPlus Pharmacy)
- Delhi (MediCare Store)
- Bangalore (WellBeing Pharmacy)
- Chennai (City Pharmacy)
- Pune (Metro Medical)

---

## ⚡ Quick Commands Reference

```bash
# Check if database is working
node check-database.js

# Reset database if needed
node setup-database.js

# Start the application
npm run dev

# Stop the application
Ctrl+C (in terminal)

# Install advanced features
bash package-install.sh
```

---

## 🎉 You're Done!

If you can:
1. ✅ Open http://localhost:5000 and see the homepage
2. ✅ Verify a drug batch number successfully
3. ✅ Search for medicine and find pharmacies
4. ✅ Login with the test accounts

Then everything is working perfectly! You now have a complete healthcare supply chain management system running on your computer.

---

## 💡 Next Steps

1. **Explore Features**: Try all the different pages and features
2. **Add Real Data**: Replace sample data with real pharmacies and drugs
3. **Configure APIs**: Add real API keys for blockchain, AI, and payment features
4. **Customize**: Modify the website to match your needs
5. **Deploy**: Put it online so others can use it

Your MedChain application is now ready to help ensure drug authenticity and help people find medicines when they need them!