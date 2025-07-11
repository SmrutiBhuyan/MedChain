#!/usr/bin/env node

/**
 * Database Status Checker for MedChain
 * Run this script to verify database integrity and view data
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(message, color = 'white') {
  console.log(colors[color] + message + colors.reset);
}

function checkDatabaseStatus() {
  const dbPath = path.join(__dirname, 'medchain.db');
  
  log('='.repeat(60), 'cyan');
  log('🏥 MedChain Database Status Checker', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // Check if database file exists
  if (!fs.existsSync(dbPath)) {
    log('❌ Database file not found!', 'red');
    log('📁 Expected location: ' + dbPath, 'yellow');
    log('💡 Run "npm run db:push" to create the database', 'blue');
    process.exit(1);
  }
  
  log('✅ Database file found', 'green');
  log('📁 Location: ' + dbPath, 'white');
  
  // Get file size
  const stats = fs.statSync(dbPath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
  log(`📊 Size: ${fileSizeInMB} MB (${fileSizeInBytes.toLocaleString()} bytes)`, 'white');
  
  try {
    const db = new Database(dbPath);
    log('✅ Database connection successful', 'green');
    
    // Check tables
    log('\n📋 Checking Tables:', 'magenta');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();
    
    if (tables.length === 0) {
      log('❌ No tables found in database', 'red');
      log('💡 Run "npm run db:push" to create tables', 'blue');
      db.close();
      process.exit(1);
    }
    
    log(`✅ Found ${tables.length} tables`, 'green');
    
    // Check each table
    const tableStats = {};
    tables.forEach(table => {
      const tableName = table.name;
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
        tableStats[tableName] = count.count;
        
        if (count.count > 0) {
          log(`  📊 ${tableName}: ${count.count} records`, 'green');
        } else {
          log(`  📊 ${tableName}: 0 records`, 'yellow');
        }
      } catch (error) {
        log(`  ❌ ${tableName}: Error reading (${error.message})`, 'red');
      }
    });
    
    // Show sample data
    log('\n📖 Sample Data:', 'magenta');
    
    // Users
    if (tableStats.users > 0) {
      log('\n👥 Users:', 'cyan');
      const users = db.prepare(`SELECT id, name, email, role FROM users LIMIT 3`).all();
      users.forEach(user => {
        log(`  • ${user.name} (${user.email}) - ${user.role}`, 'white');
      });
    }
    
    // Drugs
    if (tableStats.drugs > 0) {
      log('\n💊 Drugs:', 'cyan');
      const drugs = db.prepare(`SELECT id, name, manufacturer, batchNumber FROM drugs LIMIT 3`).all();
      drugs.forEach(drug => {
        log(`  • ${drug.name} by ${drug.manufacturer} (Batch: ${drug.batchNumber})`, 'white');
      });
    }
    
    // Pharmacies
    if (tableStats.pharmacies > 0) {
      log('\n🏪 Pharmacies:', 'cyan');
      const pharmacies = db.prepare(`SELECT id, name, city, address FROM pharmacies LIMIT 3`).all();
      pharmacies.forEach(pharmacy => {
        log(`  • ${pharmacy.name} in ${pharmacy.city}`, 'white');
      });
    }
    
    // Inventory
    if (tableStats.inventory > 0) {
      log('\n📦 Inventory:', 'cyan');
      const inventory = db.prepare(`
        SELECT i.quantity, i.lastUpdated, d.name as drugName, p.name as pharmacyName
        FROM inventory i
        JOIN drugs d ON i.drugId = d.id
        JOIN pharmacies p ON i.pharmacyId = p.id
        LIMIT 3
      `).all();
      inventory.forEach(item => {
        log(`  • ${item.drugName} at ${item.pharmacyName}: ${item.quantity} units`, 'white');
      });
    }
    
    // Verifications
    if (tableStats.verifications > 0) {
      log('\n🔍 Verifications:', 'cyan');
      const verifications = db.prepare(`
        SELECT v.result, v.timestamp, d.name as drugName, d.batchNumber
        FROM verifications v
        JOIN drugs d ON v.drugId = d.id
        ORDER BY v.timestamp DESC
        LIMIT 3
      `).all();
      verifications.forEach(verification => {
        const timestamp = new Date(verification.timestamp).toLocaleString();
        log(`  • ${verification.drugName} (${verification.batchNumber}): ${verification.result} - ${timestamp}`, 'white');
      });
    }
    
    // Database integrity check
    log('\n🔧 Database Integrity Check:', 'magenta');
    try {
      const integrity = db.prepare('PRAGMA integrity_check').all();
      if (integrity.length === 1 && integrity[0].integrity_check === 'ok') {
        log('✅ Database integrity: OK', 'green');
      } else {
        log('❌ Database integrity issues found:', 'red');
        integrity.forEach(issue => {
          log(`  • ${issue.integrity_check}`, 'red');
        });
      }
    } catch (error) {
      log('❌ Integrity check failed: ' + error.message, 'red');
    }
    
    // Show database schema
    log('\n📋 Database Schema:', 'magenta');
    tables.forEach(table => {
      const tableName = table.name;
      try {
        const schema = db.prepare(`PRAGMA table_info(${tableName})`).all();
        log(`\n📊 ${tableName} table structure:`, 'cyan');
        schema.forEach(column => {
          const nullable = column.notnull ? 'NOT NULL' : 'NULL';
          const primaryKey = column.pk ? ' (PRIMARY KEY)' : '';
          log(`  • ${column.name}: ${column.type} ${nullable}${primaryKey}`, 'white');
        });
      } catch (error) {
        log(`  ❌ Error reading schema for ${tableName}: ${error.message}`, 'red');
      }
    });
    
    // Final summary
    log('\n📊 Summary:', 'magenta');
    log(`✅ Database Status: Healthy`, 'green');
    log(`📋 Total Tables: ${tables.length}`, 'white');
    log(`📊 Total Records: ${Object.values(tableStats).reduce((a, b) => a + b, 0)}`, 'white');
    log(`💾 Database Size: ${fileSizeInMB} MB`, 'white');
    
    db.close();
    log('\n🎉 Database check completed successfully!', 'green');
    
  } catch (error) {
    log('❌ Database error: ' + error.message, 'red');
    process.exit(1);
  }
}

// Run the check
checkDatabaseStatus();