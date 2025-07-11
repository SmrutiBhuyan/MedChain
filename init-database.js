#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './shared/schema.ts';
import bcrypt from 'bcryptjs';

const sqlite = new Database('./medchain.db');
const db = drizzle(sqlite, { schema });

console.log('🗃️  Initializing MedChain database...');

try {
  // Enable foreign keys
  sqlite.exec('PRAGMA foreign_keys = ON;');
  
  console.log('✅ Database connected successfully');
  
  // Create some test users
  console.log('👥 Creating users...');
  
  const adminPassword = await bcrypt.hash('password', 10);
  const pharmacyPassword = await bcrypt.hash('password', 10);
  const patientPassword = await bcrypt.hash('password', 10);
  
  const users = await db.insert(schema.users).values([
    {
      name: 'Admin User',
      email: 'admin@medchain.com',
      password: adminPassword,
      role: 'admin'
    },
    {
      name: 'Pharmacy Manager',
      email: 'pharmacy@med.com',
      password: pharmacyPassword,
      role: 'pharmacy'
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: patientPassword,
      role: 'patient'
    }
  ]).returning();
  
  console.log(`✅ Created ${users.length} users`);
  
  // Create some test drugs
  console.log('💊 Creating drugs...');
  
  const drugs = await db.insert(schema.drugs).values([
    {
      name: 'Aspirin',
      batchNumber: 'ASP001',
      manufacturer: 'PharmaCorp',
      expiryDate: '2025-12-31',
      category: 'Pain Relief',
      strength: '500mg',
      description: 'Pain relief and anti-inflammatory medication'
    },
    {
      name: 'Paracetamol',
      batchNumber: 'PAR001',
      manufacturer: 'HealthLabs',
      expiryDate: '2025-11-30',
      category: 'Pain Relief',
      strength: '500mg',
      description: 'Fever reducer and pain reliever'
    },
    {
      name: 'Ibuprofen',
      batchNumber: 'IBU001',
      manufacturer: 'MediCore',
      expiryDate: '2025-10-31',
      category: 'Anti-inflammatory',
      strength: '400mg',
      description: 'Non-steroidal anti-inflammatory drug'
    }
  ]).returning();
  
  console.log(`✅ Created ${drugs.length} drugs`);
  
  // Create some test pharmacies
  console.log('🏪 Creating pharmacies...');
  
  const pharmacies = await db.insert(schema.pharmacies).values([
    {
      name: 'HealthPlus Pharmacy',
      city: 'Mumbai',
      address: '123 Main Street, Andheri',
      contact: '+91-9876543210',
      lat: 19.1136,
      lng: 72.8697,
      userId: users[1].id
    },
    {
      name: 'MediCare Store',
      city: 'Delhi',
      address: '456 Central Avenue, CP',
      contact: '+91-9876543211',
      lat: 28.6139,
      lng: 77.2090
    },
    {
      name: 'WellBeing Pharmacy',
      city: 'Bangalore',
      address: '789 Tech Park Road, Whitefield',
      contact: '+91-9876543212',
      lat: 12.9716,
      lng: 77.5946
    }
  ]).returning();
  
  console.log(`✅ Created ${pharmacies.length} pharmacies`);
  
  // Create inventory
  console.log('📦 Creating inventory...');
  
  const inventory = [];
  for (const pharmacy of pharmacies) {
    for (const drug of drugs) {
      inventory.push({
        pharmacyId: pharmacy.id,
        drugId: drug.id,
        quantity: Math.floor(Math.random() * 100) + 10
      });
    }
  }
  
  const inventoryRecords = await db.insert(schema.inventory).values(inventory).returning();
  console.log(`✅ Created ${inventoryRecords.length} inventory records`);
  
  // Create some test verifications
  console.log('🔍 Creating verification records...');
  
  const verifications = await db.insert(schema.verifications).values([
    {
      drugId: drugs[0].id,
      userId: users[2].id,
      location: 'Mumbai',
      result: 'genuine'
    },
    {
      drugId: drugs[1].id,
      userId: users[2].id,
      location: 'Delhi',
      result: 'genuine'
    }
  ]).returning();
  
  console.log(`✅ Created ${verifications.length} verification records`);
  
  console.log('\n🎉 Database initialization completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Drugs: ${drugs.length}`);
  console.log(`   - Pharmacies: ${pharmacies.length}`);
  console.log(`   - Inventory: ${inventoryRecords.length}`);
  console.log(`   - Verifications: ${verifications.length}`);
  
  sqlite.close();
  
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}