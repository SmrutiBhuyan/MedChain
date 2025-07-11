#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Resetting MedChain database...');

const dbPath = path.join(__dirname, 'medchain.db');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Removed existing database');
} else {
  console.log('ℹ️  No existing database found');
}

console.log('💡 Now run: npm run db:push && npm run db:seed');
console.log('🚀 Then start with: npm run dev');