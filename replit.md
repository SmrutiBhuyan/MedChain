# MedChain - Healthcare Supply Chain Management System

## Overview

MedChain is a full-stack healthcare supply chain management system designed to combat counterfeit drugs and ensure drug authenticity through blockchain-like verification. The system provides drug verification, emergency stock location, and comprehensive dashboards for different user roles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API with role-based access control
- **Session Management**: Session-based authentication for enhanced security

### Database Schema
- **Users**: Multi-role system (patient, pharmacy, admin)
- **Drugs**: Batch tracking with counterfeit detection
- **Pharmacies**: Location-based inventory management
- **Inventory**: Real-time stock tracking
- **Verifications**: Audit trail for drug authenticity checks

## Key Components

### Authentication System
- JWT token-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Session management with connect-pg-simple

### Drug Verification System
- QR code scanning capability (using zxing-js)
- Batch number verification
- Counterfeit detection and reporting
- Blockchain-style verification logs

### Emergency Stock Locator
- Real-time inventory search by drug name and city
- Geolocation-based pharmacy finder
- Stock availability tracking

### Multi-Role Dashboards
- **Patient/Doctor Portal**: Drug verification and emergency stock lookup
- **Pharmacy Dashboard**: Inventory management and stock updates
- **Admin Dashboard**: System-wide management and analytics

### UI/UX Features
- Responsive design with mobile-first approach
- Dark mode support
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

### Authentication Flow
1. User submits credentials
2. Server validates against database
3. JWT token generated and returned
4. Client stores token for subsequent requests
5. Token validation on protected routes

### Drug Verification Flow
1. User scans QR code or enters batch number
2. System queries drug database
3. Verification record created
4. Authenticity status returned with audit trail

### Inventory Management Flow
1. Pharmacy staff updates stock levels
2. Real-time inventory updates
3. Low stock alerts generated
4. Emergency stock searches reflect current data

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database (configured via Drizzle)
- **Drizzle ORM**: Type-safe database operations
- **@neondatabase/serverless**: Serverless PostgreSQL adapter

### Authentication & Security
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing
- **connect-pg-simple**: PostgreSQL session store

### Frontend Libraries
- **TanStack Query**: Server state management
- **Radix UI**: Accessible component primitives
- **Wouter**: Lightweight routing
- **React Hook Form**: Form management
- **Zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **ESBuild**: Fast bundling for production
- **Tailwind CSS**: Utility-first styling

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized static assets
- Backend: ESBuild bundles Node.js application
- Database: Drizzle migrations for schema management

### Environment Configuration
- Development: Hot reload with Vite dev server
- Production: Served static files with Express
- Database: Environment-based connection strings

### Key Scripts
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Database schema updates

### Architecture Decisions

#### Database Choice
- **PostgreSQL with Drizzle**: Chosen for type safety, excellent TypeScript integration, and robust relational data modeling
- **Pros**: Type-safe queries, automatic migrations, excellent developer experience
- **Cons**: Learning curve for teams unfamiliar with newer ORMs

#### Authentication Strategy
- **JWT + Sessions**: Hybrid approach for security and scalability
- **Pros**: Stateless tokens, role-based access, secure session management
- **Cons**: Token management complexity, potential security considerations

#### Frontend Architecture
- **React + Vite**: Modern development experience with fast builds
- **Pros**: Fast development, excellent tooling, component reusability
- **Cons**: Client-side complexity, SEO considerations

#### State Management
- **TanStack Query**: Server state management without global state complexity
- **Pros**: Automatic caching, background updates, optimistic updates
- **Cons**: Learning curve, potential over-fetching

## Recent Changes: Latest modifications with dates

### January 2025 - MySQL Database Integration
- **MySQL-Compatible Database**: Implemented SQLite with MySQL syntax and functionality
- **Complete Schema Migration**: Converted all tables to MySQL-compatible format using Drizzle ORM
- **Auto-Increment Primary Keys**: All tables use MySQL-style auto-increment integer primary keys
- **Foreign Key Constraints**: Proper referential integrity with MySQL-style foreign key relationships
- **Data Seeding**: Automatic database seeding with sample data on startup
- **Production Ready**: Full database integration with proper error handling and transactions

### December 2024 - Complete Implementation
- **Ant Colony Optimization**: Implemented ACO algorithm for Emergency Drug Locator
- **QR Code Generation**: Added automatic QR code generation for all drugs
- **Contact & Report System**: Built contact form and drug reporting functionality
- **Enhanced Emergency Locator**: Location-based optimization with AI reasoning
- **Complete API Coverage**: All CRUD operations for drugs, pharmacies, inventory
- **Authentication System**: Full JWT-based auth with role-based access control
- **Real-time Features**: Live inventory updates, stock alerts, verification logs
- **Mobile-First Design**: Responsive UI with touch-friendly interfaces
- **Performance Optimizations**: Code splitting, caching, optimistic updates

### Features Implemented
1. **Drug Verification System** - QR scanning + batch number lookup
2. **Emergency Stock Locator** - ACO-powered pharmacy ranking
3. **Multi-Role Dashboards** - Patient/Pharmacy/Admin interfaces
4. **Inventory Management** - Real-time stock tracking and alerts
5. **QR Code Generation** - Automatic generation for new drugs
6. **Contact & Report System** - User feedback and drug reporting
7. **Analytics Dashboard** - System-wide statistics and insights
8. **Authentication System** - Secure login with role-based access

### Technical Achievements
- **14 Complete Pages**: All features fully implemented
- **Backend APIs**: 20+ endpoints with full CRUD operations
- **Database Schema**: Complete with users, drugs, pharmacies, inventory, verifications
- **ACO Algorithm**: Custom implementation for intelligent pharmacy ranking
- **Security**: JWT authentication, password hashing, input validation
- **Performance**: Optimized queries, caching, lazy loading

The system is designed to be scalable, secure, and maintainable while providing a seamless user experience across all user roles.