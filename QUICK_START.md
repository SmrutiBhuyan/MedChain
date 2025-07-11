# 🚀 MedChain Quick Start Guide

## What You'll Build
A complete healthcare supply chain management system with drug verification, emergency stock locator, and pharmacy management.

## ⚡ 30-Second Setup

### 1. Start the Application
```bash
# Click the green "Run" button above
# OR type in terminal:
npm run dev
```

### 2. Wait for Success Message
```
✅ serving on port 5000
✅ Database seeded successfully!
```

### 3. Open Your App
- Look for the web preview on the right
- Or click the URL ending with `.replit.app`

## 🔐 Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medchain.com | admin123 |
| Pharmacy | pharmacy@medchain.com | pharmacy123 |
| Patient | patient@medchain.com | patient123 |

## 🧪 Test the Features

### Drug Verification
1. Go to "Verify Drug"
2. Enter batch number: `ASP001`
3. Click "Verify" → See genuine drug details

### Emergency Locator
1. Go to "Emergency Locator"
2. Enter drug: `Aspirin`, city: `New York`
3. Click "Search" → See nearby pharmacies with AI ranking

### Admin Dashboard
1. Login with admin credentials
2. View system statistics
3. Add new drugs, pharmacies, inventory

## 📊 Your Database

**Pre-loaded with:**
- 5 Drugs (including 1 counterfeit for testing)
- 5 Pharmacies across different cities
- 20 Inventory items with realistic stock
- 3 User accounts for testing

## 🎯 Key Features Working

✅ QR Code generation for drugs  
✅ Ant Colony Optimization for pharmacy ranking  
✅ Real-time inventory management  
✅ Multi-role authentication  
✅ MySQL-compatible database  
✅ Mobile-responsive design  
✅ Drug verification with audit trail  
✅ Emergency stock locator  

## 🔧 Next Steps

1. **Test all features** with the sample data
2. **Add your own data** through the admin dashboard
3. **Customize the UI** in `client/src/index.css`
4. **Explore the code** structure in different folders

## 🆘 Need Help?

- Check `SETUP_GUIDE.md` for detailed instructions
- Look at terminal for error messages
- Try refreshing if something doesn't work
- All features should work immediately after setup

**Your MedChain application is ready to use!** 🎉