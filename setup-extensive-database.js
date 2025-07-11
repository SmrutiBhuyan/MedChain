#!/usr/bin/env node

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗃️  Setting up MedChain extensive database with 100+ pharmacies...');

try {
  // Remove existing database
  const dbPath = path.join(__dirname, 'medchain.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Removed existing database');
  }

  // Create new database
  const db = new Database(dbPath);
  console.log('✅ Created new database file');

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Read and execute SQL schema
  const sqlPath = path.join(__dirname, 'extensive-database.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  db.exec(sql);
  console.log('✅ Created tables and inserted extensive data');

  // Verify the setup
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const drugCount = db.prepare('SELECT COUNT(*) as count FROM drugs').get();
  const pharmacyCount = db.prepare('SELECT COUNT(*) as count FROM pharmacies').get();
  const inventoryCount = db.prepare('SELECT COUNT(*) as count FROM inventory').get();
  const verificationCount = db.prepare('SELECT COUNT(*) as count FROM verifications').get();

  console.log('\n📊 Extensive database setup complete:');
  console.log(`   - Users: ${userCount.count}`);
  console.log(`   - Life-saving drugs: ${drugCount.count}`);
  console.log(`   - Emergency pharmacies: ${pharmacyCount.count}`);
  console.log(`   - Inventory records: ${inventoryCount.count}`);
  console.log(`   - Verifications: ${verificationCount.count}`);

  // Test regional search capability
  const mumbaiPharmacies = db.prepare(`
    SELECT name, city, address FROM pharmacies 
    WHERE city LIKE '%Mumbai%' OR city LIKE '%Thane%' OR city LIKE '%Navi Mumbai%'
  `).all();

  console.log(`\n🏙️  Mumbai region pharmacies: ${mumbaiPharmacies.length}`);
  mumbaiPharmacies.forEach(pharmacy => {
    console.log(`   - ${pharmacy.name} in ${pharmacy.city}`);
  });

  // Test city search with regional results
  const delhiRegionPharmacies = db.prepare(`
    SELECT name, city, address FROM pharmacies 
    WHERE city LIKE '%Delhi%' OR city LIKE '%Gurgaon%' OR city LIKE '%Noida%' OR city LIKE '%Faridabad%'
  `).all();

  console.log(`\n🏛️  Delhi NCR region pharmacies: ${delhiRegionPharmacies.length}`);
  delhiRegionPharmacies.forEach(pharmacy => {
    console.log(`   - ${pharmacy.name} in ${pharmacy.city}`);
  });

  db.close();
  console.log('\n🎉 Extensive database with regional coverage is ready!');
  console.log('🗺️  Features: 100+ pharmacies across major cities and regions');
  console.log('💊 25 critical life-saving medicines');
  console.log('📍 GPS coordinates for map integration');
  console.log('🔍 Regional search support (e.g., Mumbai includes Thane, Navi Mumbai)');

} catch (error) {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
}