# MedChain Setup Guide for Beginners

This guide will walk you through setting up and running the MedChain healthcare supply chain application. No prior experience required!

## What is MedChain?

MedChain is a complete healthcare supply chain management system that helps:
- Verify if medicines are genuine or counterfeit
- Find emergency medicine stock in nearby pharmacies
- Manage pharmacy inventory
- Track drug verification history
- Generate QR codes for medicines

## Step 1: Understanding Your Environment

You're running this on Replit, which means everything is already set up for you! Here's what you have:

### Pre-installed Components:
- **Node.js**: JavaScript runtime
- **Database**: MySQL-compatible database with sample data
- **Frontend**: React website with modern UI
- **Backend**: Express.js server with APIs

## Step 2: Starting the Application

### Option A: Using the Run Button (Easiest)
1. Look for the green "Run" button at the top of your screen
2. Click it - the application will start automatically
3. Wait for the message "serving on port 5000"
4. Your application is now running!

### Option B: Using the Terminal
1. Open the terminal (Shell tab)
2. Type: `npm run dev`
3. Press Enter
4. Wait for "serving on port 5000"

## Step 3: Accessing Your Application

Once the application is running:
1. Look for the web preview panel on the right side
2. Or click the URL that appears (usually ends with `.replit.app`)
3. You should see the MedChain landing page

## Step 4: Understanding the Application Structure

### Main Features:
1. **Drug Verification**: Check if medicines are genuine
2. **Emergency Locator**: Find medicines in nearby pharmacies
3. **Admin Dashboard**: Manage the entire system
4. **Pharmacy Dashboard**: Manage inventory
5. **Patient Portal**: Verify medicines and find stock

### Test Accounts:
The application comes with pre-created accounts:

**Admin Account:**
- Email: `admin@medchain.com`
- Password: `admin123`

**Pharmacy Account:**
- Email: `pharmacy@medchain.com`
- Password: `pharmacy123`

**Patient Account:**
- Email: `patient@medchain.com`
- Password: `patient123`

## Step 5: Testing the Application

### Test Drug Verification:
1. Go to "Verify Drug" page
2. Enter batch number: `ASP001`
3. Click "Verify"
4. You should see drug details and verification status

### Test Emergency Locator:
1. Go to "Emergency Locator" page
2. Enter drug name: `Aspirin`
3. Enter city: `New York`
4. Click "Search"
5. You'll see nearby pharmacies with stock

### Test Admin Dashboard:
1. Login with admin credentials
2. Go to "Admin Dashboard"
3. See system statistics and manage data
4. Add new drugs, pharmacies, or inventory

## Step 6: Understanding the Database

Your application uses a MySQL-compatible database with:

### Sample Data Included:
- **5 Drugs**: Including genuine and counterfeit examples
- **5 Pharmacies**: Located in different cities
- **20 Inventory Items**: Stock levels across pharmacies
- **3 User Accounts**: Admin, pharmacy, and patient roles

### Database Tables:
1. **Users**: Account information
2. **Drugs**: Medicine details and batch numbers
3. **Pharmacies**: Pharmacy locations and contact info
4. **Inventory**: Stock levels at each pharmacy
5. **Verifications**: History of drug checks

## Step 7: Customizing Your Application

### Adding New Drugs:
1. Login as admin
2. Go to "Add Drug" page
3. Fill in the details:
   - Name: e.g., "Paracetamol"
   - Batch Number: e.g., "PAR123"
   - Manufacturer: e.g., "PharmaCorp"
   - Expiry Date: e.g., "2025-12-31"
4. Click "Add Drug"

### Adding New Pharmacies:
1. Login as admin
2. Go to admin dashboard
3. Add pharmacy details including location
4. Set up inventory for the pharmacy

### Managing Inventory:
1. Login as pharmacy user
2. Go to "Pharmacy Dashboard"
3. Update stock levels
4. View low stock alerts

## Step 8: Advanced Features

### QR Code Generation:
- Every drug automatically gets a QR code
- QR codes can be scanned to verify medicines
- Codes contain batch number and drug information

### Smart Pharmacy Ranking:
- Emergency locator uses AI algorithm
- Ranks pharmacies by stock, distance, and freshness
- Provides detailed explanations for recommendations

### Verification Tracking:
- Every drug check is logged
- Maintains audit trail for counterfeit detection
- Supports blockchain-style verification

## Step 9: Troubleshooting Common Issues

### Application Won't Start:
1. Check if the "Run" button shows any errors
2. Look at the terminal for error messages
3. Try refreshing the page
4. Restart by clicking the "Run" button again

### Database Errors:
1. The database resets automatically if needed
2. Sample data is recreated on startup
3. No manual intervention required

### Login Issues:
1. Use the exact email and password from Step 4
2. Check for typos in credentials
3. Try refreshing the page

### Missing Features:
1. All features should work immediately
2. If something doesn't work, check the console for errors
3. Try logging out and logging back in

## Step 10: Next Steps

### Explore the Code:
- **Frontend**: Check `client/src/pages/` for different pages
- **Backend**: Look at `server/routes.ts` for API endpoints
- **Database**: See `shared/schema.ts` for database structure

### Modify the Application:
- Change colors in `client/src/index.css`
- Add new features by creating new pages
- Modify sample data in `server/seed.ts`

### Deploy Your Application:
1. Your application is already live on Replit
2. Share the URL with others
3. For production deployment, use Replit's deployment features

## Important File Locations

```
MedChain/
├── client/                 # Frontend application
│   ├── src/pages/         # All website pages
│   └── src/components/    # Reusable components
├── server/                # Backend server
│   ├── routes.ts         # API endpoints
│   ├── db.ts            # Database connection
│   └── seed.ts          # Sample data
├── shared/               # Shared code
│   └── schema.ts        # Database structure
└── medchain.db          # Your database file
```

## Getting Help

If you encounter issues:
1. Check the terminal for error messages
2. Look at the browser console (F12 → Console)
3. Try restarting the application
4. Review this guide for common solutions

## Summary

You now have a complete healthcare supply chain application running with:
- ✅ Drug verification system
- ✅ Emergency stock locator
- ✅ Multi-role dashboards
- ✅ Inventory management
- ✅ QR code generation
- ✅ MySQL-compatible database
- ✅ Sample data for testing

Your application is ready to use! Start by exploring the different features and testing with the provided sample data.