import { db } from "./db";
import { users, drugs, pharmacies, inventory, verifications } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    // Create users
    const adminUser = await db.insert(users).values({
      name: "Admin User",
      email: "admin@medchain.com",
      password: await bcrypt.hash("password", 10),
      role: "admin",
    }).returning();

    const pharmacyUser = await db.insert(users).values({
      name: "Pharmacy Manager",
      email: "pharmacy@medchain.com",
      password: await bcrypt.hash("password", 10),
      role: "pharmacy",
    }).returning();

    const patientUser = await db.insert(users).values({
      name: "Patient User",
      email: "patient@medchain.com",
      password: await bcrypt.hash("password", 10),
      role: "patient",
    }).returning();

    // Create drugs
    const drugsData = [
      {
        name: "Insulin",
        batchNumber: "INS-2024-026",
        manufacturer: "DiabetesCare Pharma",
        expiryDate: "2025-06-15",
        category: "Diabetes",
        strength: "100 units/ml",
        description: "Diabetes medication for blood sugar control",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=INS-2024-026",
        isCounterfeit: false,
      },
      {
        name: "Morphine",
        batchNumber: "MOR-2024-041",
        manufacturer: "PainRelief Corp",
        expiryDate: "2025-08-20",
        category: "Pain Management",
        strength: "10mg",
        description: "Pain management medication",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MOR-2024-041",
        isCounterfeit: false,
      },
      {
        name: "Digoxin",
        batchNumber: "DIG-2024-051",
        manufacturer: "HeartCare Pharma",
        expiryDate: "2025-07-10",
        category: "Heart Medication",
        strength: "0.25mg",
        description: "Heart medication for cardiac conditions",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DIG-2024-051",
        isCounterfeit: false,
      },
      {
        name: "Paracetamol",
        batchNumber: "PAR-2024-001",
        manufacturer: "HealthLabs",
        expiryDate: "2025-10-15",
        category: "Pain Relief",
        strength: "500mg",
        description: "Pain relief and fever reducer",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAR-2024-001",
        isCounterfeit: false,
      },
      {
        name: "Amoxicillin",
        batchNumber: "AMO-2024-015",
        manufacturer: "BioPharma",
        expiryDate: "2025-09-20",
        category: "Antibiotic",
        strength: "250mg",
        description: "Antibiotic for bacterial infections",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AMO-2024-015",
        isCounterfeit: false,
      },
      {
        name: "Aspirin",
        batchNumber: "ASP-2024-003",
        manufacturer: "PharmaCorp",
        expiryDate: "2025-12-31",
        category: "Pain Relief",
        strength: "100mg",
        description: "Pain relief medication",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ASP-2024-003",
        isCounterfeit: false,
      },
      {
        name: "Metformin",
        batchNumber: "MET-2024-007",
        manufacturer: "DiabetesCare Pharma",
        expiryDate: "2025-11-30",
        category: "Diabetes",
        strength: "500mg",
        description: "Diabetes medication for blood sugar control",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MET-2024-007",
        isCounterfeit: false,
      },
      {
        name: "Losartan",
        batchNumber: "LOS-2024-019",
        manufacturer: "HeartCare Pharma",
        expiryDate: "2025-08-15",
        category: "Blood Pressure",
        strength: "50mg",
        description: "Blood pressure medication",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LOS-2024-019",
        isCounterfeit: false,
      },
      {
        name: "Epinephrine",
        batchNumber: "EPI-2024-001",
        manufacturer: "Unknown",
        expiryDate: "2024-01-01",
        category: "Emergency",
        strength: "1mg/ml",
        description: "COUNTERFEIT - Emergency medication - DO NOT USE",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EPI-2024-001",
        isCounterfeit: true,
      },
    ];

    const insertedDrugs = await db.insert(drugs).values(drugsData).returning();

    // Create pharmacies
    const pharmaciesData = [
      {
        name: "Central Pharmacy",
        city: "New York",
        address: "123 Main St, New York, NY 10001",
        contact: "+1-555-0101",
        lat: 40.7128,
        lng: -74.0060,
        userId: pharmacyUser[0].id,
      },
      {
        name: "Downtown Pharmacy",
        city: "New York",
        address: "456 Broadway, New York, NY 10002",
        contact: "+1-555-0102",
        lat: 40.7589,
        lng: -73.9851,
        userId: null,
      },
      {
        name: "West Side Pharmacy",
        city: "Los Angeles",
        address: "789 Sunset Blvd, Los Angeles, CA 90028",
        contact: "+1-555-0103",
        lat: 34.0522,
        lng: -118.2437,
        userId: null,
      },
      {
        name: "East Bay Pharmacy",
        city: "San Francisco",
        address: "321 Market St, San Francisco, CA 94102",
        contact: "+1-555-0104",
        lat: 37.7749,
        lng: -122.4194,
        userId: null,
      },
      {
        name: "Lincoln Park Pharmacy",
        city: "Chicago",
        address: "654 Lincoln Ave, Chicago, IL 60614",
        contact: "+1-555-0105",
        lat: 41.8781,
        lng: -87.6298,
        userId: null,
      },
    ];

    const insertedPharmacies = await db.insert(pharmacies).values(pharmaciesData).returning();

    // Create inventory
    const inventoryData = [];
    for (const pharmacy of insertedPharmacies) {
      for (const drug of insertedDrugs.slice(0, 4)) { // Only add genuine drugs to inventory
        inventoryData.push({
          pharmacyId: pharmacy.id,
          drugId: drug.id,
          quantity: Math.floor(Math.random() * 100) + 10, // Random quantity between 10-110
        });
      }
    }

    await db.insert(inventory).values(inventoryData);

    // Create some sample verifications
    const verificationsData = [
      {
        drugId: insertedDrugs[0].id, // Insulin
        userId: patientUser[0].id,
        location: "New York, NY",
        result: "genuine",
      },
      {
        drugId: insertedDrugs[1].id, // Morphine
        userId: patientUser[0].id,
        location: "Los Angeles, CA",
        result: "genuine",
      },
      {
        drugId: insertedDrugs[8].id, // Epinephrine (Counterfeit)
        userId: adminUser[0].id,
        location: "Chicago, IL",
        result: "counterfeit",
      },
    ];

    await db.insert(verifications).values(verificationsData);

    console.log("Database seeded successfully!");
    console.log(`Created ${drugsData.length} drugs, ${pharmaciesData.length} pharmacies, ${inventoryData.length} inventory items, and ${verificationsData.length} verifications.`);
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };