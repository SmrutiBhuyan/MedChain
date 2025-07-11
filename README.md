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
- **PostgreSQL**: Production-ready relational database with full ACID compliance
- **Drizzle ORM**: Type-safe database operations with PostgreSQL-specific features
- **Auto-increment Primary Keys**: PostgreSQL `generatedAlwaysAsIdentity()` implementation
- **Foreign Key Constraints**: Proper referential integrity with PostgreSQL foreign keys
- **Cross-Platform Compatibility**: No SQLite native binding issues

### AI & Algorithms
- **Ant Colony Optimization**: Emergency stock locator optimization
- **Geolocation API**: Distance-based pharmacy ranking
- **Real-time Analytics**: Smart inventory management

## 🚀 Complete Localhost Setup Guide

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Modern web browser with geolocation support
- PostgreSQL database (provided automatically in Replit environment)

### Step 1: Environment Setup
The system uses PostgreSQL with all required environment variables pre-configured:
```bash
# Database connection is automatically available via:
# DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
```

### Step 2: Install Dependencies
```bash
# All dependencies are already installed including:
# - React/TypeScript frontend with Vite
# - Express.js backend with PostgreSQL
# - Drizzle ORM for database operations
# - Ola Maps integration with OpenStreetMap fallback
# - Complete UI components with shadcn/ui
npm list --depth=0
```

### Step 3: Database Initialization
```bash
# Database schema is automatically created and seeded
# PostgreSQL tables: users, drugs, pharmacies, inventory, verifications
# Sample data includes 3+ records in each table
```

### Step 4: Start the Application
```bash
# Start both frontend and backend servers
npm run dev
```

The application will be available at `http://localhost:5000`

### Step 5: Map Integration Setup
The system includes:
- **Primary**: Ola Maps API with key: `SuoxlmXRea98IUzTc8v4sW0cPphMARvFq43BiRQf`
- **Fallback**: OpenStreetMap tiles for 100% reliability
- **Auto-detection**: Automatically switches to fallback if Ola Maps is unavailable

### Step 6: Test the System

#### 1. Test Drug Verification
- Navigate to "Verify Drug" page
- Enter batch number: `MED-2024-001` (Paracetamol)
- Or try: `ASP-2024-045` (Aspirin), `AMX-2024-078` (Amoxicillin)
- View verification result with blockchain transaction ID

#### 2. Test Emergency Locator with Maps
- Go to "Emergency Locator" page
- Search for: Drug: `Aspirin`, City: `Mumbai`
- Enable location access for optimized results
- View ACO-optimized pharmacy rankings
- **Interactive Map**: See pharmacy locations with automatic fallback system

#### 3. Test Admin Features
- Login with admin credentials:
  - Email: `admin@medchain.com`
  - Password: `password`
- Access admin dashboard
- Add new drugs with automatic QR code generation
- View system statistics

#### 4. Test Pharmacy Features
- Login with pharmacy credentials:
  - Email: `pharmacy@medchain.com`
  - Password: `password`
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

### PostgreSQL Database Schema
```sql
-- Users (multi-role system)
users: id (serial), name, email, password, role, created_at (timestamp)

-- Drugs (batch tracking)
drugs: id (serial), name, batch_number, manufacturer, expiry_date, 
       category, strength, description, qr_code_url, is_counterfeit, created_at

-- Pharmacies (location-based with GPS)
pharmacies: id (serial), name, address, city, contact, lat, lng, 
           user_id (foreign key), created_at

-- Inventory (real-time tracking)
inventory: id (serial), drug_id (foreign key), pharmacy_id (foreign key), 
          quantity, last_updated (timestamp)

-- Verifications (audit trail)
verifications: id (serial), drug_id (foreign key), user_id (foreign key), 
              location, result, timestamp
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
- **Admin User**: admin@medchain.com / password
- **Pharmacy User**: pharmacy@medchain.com / password  
- **Patient User**: patient@medchain.com / password
- **Sample Drugs**: MED-2024-001 (Paracetamol), ASP-2024-045 (Aspirin), AMX-2024-078 (Amoxicillin)
- **Sample Pharmacies**: Apollo Pharmacy (Mumbai), MedPlus (Mumbai), HealthMart (Delhi)
- **GPS Coordinates**: All pharmacies include accurate latitude/longitude for mapping

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

## 🚀 Production Ready

The application is configured for easy deployment:
- **Production Build**: `npm run build`
- **PostgreSQL Database**: Fully integrated with proper schema and relationships
- **Environment Variables**: Pre-configured for Replit deployment
- **Static Assets**: Optimized for CDN delivery
- **Cross-Platform**: No SQLite native binding issues
- **Map Integration**: Reliable with intelligent fallback system

## 📞 Support

For technical support or questions:
- Use the built-in "Support" page
- Submit bug reports via "Report Drug" page
- Contact: support@medchain.com

## 📝 License

This project is built for educational and healthcare purposes. All rights reserved.

---

**MedChain - Securing Healthcare Supply Chains with Technology** 🏥💊✨