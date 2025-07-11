// Simple database check script
import Database from 'better-sqlite3';

try {
  console.log('🔍 Checking MedChain Database...\n');
  
  // Open database
  const db = new Database('medchain.db');
  
  // Check tables
  console.log('📊 DATABASE TABLES:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  tables.forEach(table => console.log(`  ✓ ${table.name}`));
  
  console.log('\n📈 TABLE COUNTS:');
  
  // Count users
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  console.log(`  👥 Users: ${userCount.count}`);
  
  // Count drugs
  const drugCount = db.prepare("SELECT COUNT(*) as count FROM drugs").get();
  console.log(`  💊 Drugs: ${drugCount.count}`);
  
  // Count pharmacies
  const pharmacyCount = db.prepare("SELECT COUNT(*) as count FROM pharmacies").get();
  console.log(`  🏥 Pharmacies: ${pharmacyCount.count}`);
  
  // Count inventory
  const inventoryCount = db.prepare("SELECT COUNT(*) as count FROM inventory").get();
  console.log(`  📦 Inventory Items: ${inventoryCount.count}`);
  
  // Count verifications
  const verificationCount = db.prepare("SELECT COUNT(*) as count FROM verifications").get();
  console.log(`  🔐 Verifications: ${verificationCount.count}`);
  
  console.log('\n🧪 SAMPLE DATA:');
  
  // Show sample users
  const sampleUsers = db.prepare("SELECT name, email, role FROM users LIMIT 3").all();
  console.log('  👥 Sample Users:');
  sampleUsers.forEach(user => console.log(`    - ${user.name} (${user.email}) - Role: ${user.role}`));
  
  // Show sample drugs
  const sampleDrugs = db.prepare("SELECT name, batch_number, manufacturer FROM drugs LIMIT 3").all();
  console.log('  💊 Sample Drugs:');
  sampleDrugs.forEach(drug => console.log(`    - ${drug.name} (${drug.batch_number}) by ${drug.manufacturer}`));
  
  // Show sample pharmacies
  const samplePharmacies = db.prepare("SELECT name, city, contact FROM pharmacies LIMIT 3").all();
  console.log('  🏥 Sample Pharmacies:');
  samplePharmacies.forEach(pharmacy => console.log(`    - ${pharmacy.name} in ${pharmacy.city} (${pharmacy.contact})`));
  
  console.log('\n✅ DATABASE CHECK COMPLETE - All looks good!');
  
  db.close();
  
} catch (error) {
  console.error('❌ Database Error:', error.message);
  process.exit(1);
}