# MedChain - Healthcare Supply Chain Management System

## 🏥 Project Overview

MedChain is a comprehensive full-stack healthcare supply chain management system designed to combat counterfeit drugs and ensure drug authenticity through blockchain-style verification. The platform provides drug verification, emergency stock location, and comprehensive dashboards for different user roles.

## ✨ Key Features

### 🔍 Drug Authentication & Verification
- **QR Code Scanning**: Scan drug QR codes or enter batch numbers manually
- **Blockchain-Style Verification**: Immutable verification logs with transaction IDs
- **Counterfeit Detection**: Real-time authenticity checking
- **Audit Trail**: Complete history of all drug verifications

### 🚨 Emergency Stock Locator (with AI)
- **Ant Colony Optimization (ACO) Algorithm**: Intelligent pharmacy ranking
- **Real-Time Stock Search**: Find medicines across pharmacies instantly
- **Location-Based Optimization**: Uses GPS for distance-based results
- **Multi-Factor Ranking**: Considers stock levels, distance, and data freshness

### 👥 Multi-Role Dashboard System
- **Patient/Doctor Portal**: Drug verification and emergency stock lookup
- **Pharmacy Dashboard**: Inventory management and stock alerts
- **Admin Dashboard**: System-wide management and analytics

### 📊 Advanced Features
- **QR Code Generation**: Automatic QR code creation for new drugs
- **Low Stock Alerts**: Automated notifications for pharmacies
- **Contact & Report System**: Report suspicious drug activity
- **Comprehensive Analytics**: System-wide statistics and insights

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern component-based UI
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **TanStack Query**: Server state management
- **Wouter**: Lightweight routing
- **React Hook Form**: Form management with validation

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe backend development
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **QRCode**: QR code generation
- **Zod**: Runtime type validation

### Database & Storage
- **MySQL-Compatible Database**: SQLite with MySQL syntax and functionality
- **Drizzle ORM**: Type-safe database operations with MySQL-style schemas
- **Auto-increment Primary Keys**: MySQL-standard database design
- **Foreign Key Constraints**: Proper referential integrity

### AI & Algorithms
- **Ant Colony Optimization**: Emergency stock locator optimization
- **Geolocation API**: Distance-based pharmacy ranking
- **Real-time Analytics**: Smart inventory management

## 🚀 Complete Setup Guide

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Modern web browser with geolocation support

### Step 1: Project Setup
```bash
# Clone or download the project
# All dependencies are already installed

# Verify installation
npm list --depth=0
```

### Step 2: Environment Configuration
The system works out of the box with default settings. No additional environment variables are required for development.

### Step 3: Start the Application
```bash
# Start both frontend and backend servers
npm run dev
```

The application will be available at `http://localhost:5000`

### Step 4: Test the System

#### 1. Test Drug Verification
- Navigate to "Verify Drug" page
- Enter batch number: `BN001` (sample drug)
- Or scan QR code if available
- View verification result with blockchain transaction ID

#### 2. Test Emergency Locator
- Go to "Emergency Locator" page
- Search for: Drug: `Paracetamol`, City: `Mumbai`
- Enable location access for optimized results
- View ACO-optimized pharmacy rankings

#### 3. Test Admin Features
- Login with admin credentials:
  - Email: `admin@medchain.com`
  - Password: `admin123`
- Access admin dashboard
- Add new drugs with automatic QR code generation
- View system statistics

#### 4. Test Pharmacy Features
- Login with pharmacy credentials:
  - Email: `pharmacy@medchain.com`
  - Password: `pharmacy123`
- Manage inventory
- View stock alerts
- Update drug quantities

### Step 5: Test Advanced Features

#### Report Suspicious Drugs
- Navigate to "Report Drug" page
- Submit reports for investigation
- View confirmation with report ID

#### Contact System
- Use "Support" page to contact administrators
- Test the contact form functionality

## 📚 User Guide

### For Patients/Doctors
1. **Verify Drug Authenticity**
   - Use QR scanner or enter batch number manually
   - Check verification status and manufacturer details
   - View blockchain transaction for authenticity proof

2. **Find Emergency Stock**
   - Enter drug name and city
   - Enable location for best results
   - View AI-optimized pharmacy rankings

### For Pharmacies
1. **Manage Inventory**
   - Login to pharmacy dashboard
   - Add/update drug stock quantities
   - Monitor low stock alerts

2. **View Analytics**
   - Check inventory turnover
   - Monitor expiring drugs
   - Track verification requests

### For Administrators
1. **Drug Management**
   - Add new drugs to the system
   - Generate QR codes automatically
   - Monitor counterfeit reports

2. **System Administration**
   - View system-wide statistics
   - Manage user accounts
   - Monitor verification logs

## 🔧 Technical Implementation

### Database Schema
```sql
-- Users (multi-role system)
users: id, name, email, password, role, created_at

-- Drugs (batch tracking)
drugs: id, name, batch_number, manufacturer, expiry_date, 
       qr_code_url, is_counterfeit, created_at

-- Pharmacies (location-based)
pharmacies: id, name, address, city, contact, lat, lng, 
           user_id, created_at

-- Inventory (real-time tracking)
inventory: id, drug_id, pharmacy_id, quantity, last_updated

-- Verifications (audit trail)
verifications: id, drug_id, user_id, location, result, timestamp
```

### API Endpoints
```javascript
// Authentication
POST /api/auth/login
POST /api/auth/register

// Drug Management
GET /api/drugs
POST /api/drugs (Admin only)
GET /api/drugs/batch/:batchNumber
POST /api/verify-drug

// Emergency Locator with ACO
GET /api/emergency-locator?drugName=X&city=Y&lat=Z&lng=W

// Inventory Management
GET /api/inventory/pharmacy/:id
POST /api/inventory (Pharmacy only)
PUT /api/inventory/:id (Pharmacy only)

// Reports and Contact
POST /api/contact
POST /api/report-drug

// Analytics
GET /api/stats (Authenticated)
```

### ACO Algorithm Implementation
The Emergency Drug Locator uses Ant Colony Optimization to rank pharmacies based on:
- **Pheromone Level**: Stock quantity (higher stock = higher pheromone)
- **Heuristic Value**: Distance (closer = higher value)
- **Freshness Factor**: Data recency (newer = higher weight)

Formula: `Score = (Pheromone^α × Distance^β × Freshness) × Weights`

## 🧪 Testing the System

### Sample Data Available
- **Admin User**: admin@medchain.com / admin123
- **Pharmacy User**: pharmacy@medchain.com / pharmacy123
- **Sample Drugs**: BN001, BN002, BN003 (various manufacturers)
- **Sample Pharmacies**: Apollo Pharmacy, MedPlus, etc.

### Test Scenarios
1. **Drug Verification Flow**
   - Scan QR code → Get drug details → View verification log
   
2. **Emergency Locator Flow**
   - Enter drug name → Enable location → View ACO-optimized results
   
3. **Inventory Management Flow**
   - Login as pharmacy → Update stock → View alerts

4. **Admin Management Flow**
   - Login as admin → Add new drug → Generate QR code → View statistics

## 📊 System Architecture

### Frontend Architecture
```
/client
├── /src
│   ├── /components    # Reusable UI components
│   ├── /pages         # Page components (13+ pages)
│   ├── /hooks         # Custom React hooks
│   ├── /lib           # Utility functions
│   └── /assets        # Static assets
```

### Backend Architecture
```
/server
├── index.ts           # Main server entry point
├── routes.ts          # API route definitions
├── storage.ts         # Database operations
├── vite.ts           # Vite development server
└── /utils
    └── acoRank.ts     # ACO algorithm implementation
```

### Key Components
- **Authentication System**: JWT-based with role-based access
- **QR Code System**: Generation and scanning capabilities
- **ACO Algorithm**: Emergency stock optimization
- **Real-time Updates**: Live inventory management
- **Responsive Design**: Mobile-first approach

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based sessions
- **Input Validation**: Zod schema validation
- **CORS Protection**: Cross-origin request security
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## 📈 Performance Optimizations

- **Code Splitting**: Dynamic imports for pages
- **Caching**: TanStack Query for API responses
- **Optimistic Updates**: Immediate UI feedback
- **Lazy Loading**: Components loaded on demand
- **Bundle Optimization**: Vite's optimized builds

## 🚀 Deployment Ready

The application is configured for easy deployment:
- **Production Build**: `npm run build`
- **Environment Variables**: Configurable for production
- **Database**: Ready for PostgreSQL connection
- **Static Assets**: Optimized for CDN delivery

## 📞 Support

For technical support or questions:
- Use the built-in "Support" page
- Submit bug reports via "Report Drug" page
- Contact: support@medchain.com

## 📝 License

This project is built for educational and healthcare purposes. All rights reserved.

---

**MedChain - Securing Healthcare Supply Chains with Technology** 🏥💊✨