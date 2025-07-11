#!/usr/bin/env node

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗃️  Setting up MedChain database...');

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
  const sqlPath = path.join(__dirname, 'create-tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  db.exec(sql);
  console.log('✅ Created tables and inserted sample data');

  // Verify the setup
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const drugCount = db.prepare('SELECT COUNT(*) as count FROM drugs').get();
  const pharmacyCount = db.prepare('SELECT COUNT(*) as count FROM pharmacies').get();
  const inventoryCount = db.prepare('SELECT COUNT(*) as count FROM inventory').get();
  const verificationCount = db.prepare('SELECT COUNT(*) as count FROM verifications').get();

  console.log('\n📊 Database setup complete:');
  console.log(`   - Users: ${userCount.count}`);
  console.log(`   - Drugs: ${drugCount.count}`);
  console.log(`   - Pharmacies: ${pharmacyCount.count}`);
  console.log(`   - Inventory records: ${inventoryCount.count}`);
  console.log(`   - Verifications: ${verificationCount.count}`);

  // Test a query to make sure everything works
  const testQuery = db.prepare(`
    SELECT d.name as drug_name, p.name as pharmacy_name, i.quantity
    FROM inventory i
    JOIN drugs d ON i.drug_id = d.id
    JOIN pharmacies p ON i.pharmacy_id = p.id
    LIMIT 3
  `).all();

  console.log('\n🔍 Sample inventory data:');
  testQuery.forEach(row => {
    console.log(`   - ${row.drug_name} at ${row.pharmacy_name}: ${row.quantity} units`);
  });

  db.close();
  console.log('\n🎉 Database is ready! You can now start the application with: npm run dev');

} catch (error) {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
}