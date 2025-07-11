import { 
  users, drugs, pharmacies, inventory, verifications,
  type User, type Drug, type Pharmacy, type Inventory, type Verification,
  type InsertUser, type InsertDrug, type InsertPharmacy, type InsertInventory, type InsertVerification 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Drugs
  getDrug(id: number): Promise<Drug | undefined>;
  getDrugByBatchNumber(batchNumber: string): Promise<Drug | undefined>;
  getAllDrugs(): Promise<Drug[]>;
  createDrug(drug: InsertDrug): Promise<Drug>;
  updateDrug(id: number, drug: Partial<InsertDrug>): Promise<Drug | undefined>;
  deleteDrug(id: number): Promise<boolean>;
  
  // Pharmacies
  getPharmacy(id: number): Promise<Pharmacy | undefined>;
  getAllPharmacies(): Promise<Pharmacy[]>;
  getPharmaciesByCity(city: string): Promise<Pharmacy[]>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;
  updatePharmacy(id: number, pharmacy: Partial<InsertPharmacy>): Promise<Pharmacy | undefined>;
  
  // Inventory
  getInventory(pharmacyId: number): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]>;
  getInventoryByDrug(drugId: number): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]>;
  searchInventory(drugName: string, city: string): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, inventory: Partial<InsertInventory>): Promise<Inventory | undefined>;
  deleteInventory(id: number): Promise<boolean>;
  
  // Verifications
  getVerification(id: number): Promise<Verification | undefined>;
  getAllVerifications(): Promise<(Verification & { drug: Drug; user?: User })[]>;
  createVerification(verification: InsertVerification): Promise<Verification>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drugs: Map<number, Drug>;
  private pharmacies: Map<number, Pharmacy>;
  private inventory: Map<number, Inventory>;
  private verifications: Map<number, Verification>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.drugs = new Map();
    this.pharmacies = new Map();
    this.inventory = new Map();
    this.verifications = new Map();
    this.currentIds = {
      users: 1,
      drugs: 1,
      pharmacies: 1,
      inventory: 1,
      verifications: 1,
    };
    this.initializeData();
  }

  private async initializeData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentIds.users++,
      name: "Admin User",
      email: "admin@medchain.com",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample pharmacy user
    const pharmacyUser: User = {
      id: this.currentIds.users++,
      name: "Apollo Pharmacy",
      email: "apollo@medchain.com",
      password: await bcrypt.hash("pharmacy123", 10),
      role: "pharmacy",
      createdAt: new Date(),
    };
    this.users.set(pharmacyUser.id, pharmacyUser);

    // Create sample patient user
    const patientUser: User = {
      id: this.currentIds.users++,
      name: "Dr. John Doe",
      email: "doctor@medchain.com",
      password: await bcrypt.hash("patient123", 10),
      role: "patient",
      createdAt: new Date(),
    };
    this.users.set(patientUser.id, patientUser);

    // Create sample drugs
    const sampleDrugs: Drug[] = [
      {
        id: this.currentIds.drugs++,
        name: "Paracetamol 500mg",
        batchNumber: "MED-2024-001",
        manufacturer: "XYZ Pharmaceuticals",
        expiryDate: "2025-12-31",
        category: "pain-relief",
        strength: "500mg",
        description: "Pain relief medication",
        qrCodeUrl: null,
        isCounterfeit: false,
        createdAt: new Date(),
      },
      {
        id: this.currentIds.drugs++,
        name: "Aspirin 100mg",
        batchNumber: "ASP-2024-045",
        manufacturer: "ABC Healthcare",
        expiryDate: "2024-11-30",
        category: "pain-relief",
        strength: "100mg",
        description: "Blood thinner and pain relief",
        qrCodeUrl: null,
        isCounterfeit: false,
        createdAt: new Date(),
      },
      {
        id: this.currentIds.drugs++,
        name: "Amoxicillin 250mg",
        batchNumber: "AMX-2024-078",
        manufacturer: "MediCorp",
        expiryDate: "2025-06-15",
        category: "antibiotics",
        strength: "250mg",
        description: "Antibiotic for bacterial infections",
        qrCodeUrl: null,
        isCounterfeit: false,
        createdAt: new Date(),
      },
    ];

    sampleDrugs.forEach(drug => this.drugs.set(drug.id, drug));

    // Create sample pharmacies
    const samplePharmacies: Pharmacy[] = [
      {
        id: this.currentIds.pharmacies++,
        name: "Apollo Pharmacy",
        city: "Mumbai",
        address: "123 Main Street, Andheri West, Mumbai",
        contact: "+91-9876543210",
        lat: "19.1136",
        lng: "72.8697",
        userId: pharmacyUser.id,
        createdAt: new Date(),
      },
      {
        id: this.currentIds.pharmacies++,
        name: "MedPlus Pharmacy",
        city: "Mumbai",
        address: "456 Central Avenue, Bandra, Mumbai",
        contact: "+91-9876543211",
        lat: "19.0596",
        lng: "72.8295",
        userId: null,
        createdAt: new Date(),
      },
      {
        id: this.currentIds.pharmacies++,
        name: "HealthMart Pharmacy",
        city: "Delhi",
        address: "789 Ring Road, Connaught Place, Delhi",
        contact: "+91-9876543212",
        lat: "28.6315",
        lng: "77.2167",
        userId: null,
        createdAt: new Date(),
      },
    ];

    samplePharmacies.forEach(pharmacy => this.pharmacies.set(pharmacy.id, pharmacy));

    // Create sample inventory
    const sampleInventory: Inventory[] = [
      {
        id: this.currentIds.inventory++,
        pharmacyId: 1,
        drugId: 1,
        quantity: 150,
        lastUpdated: new Date(),
      },
      {
        id: this.currentIds.inventory++,
        pharmacyId: 1,
        drugId: 2,
        quantity: 8,
        lastUpdated: new Date(),
      },
      {
        id: this.currentIds.inventory++,
        pharmacyId: 2,
        drugId: 1,
        quantity: 25,
        lastUpdated: new Date(),
      },
      {
        id: this.currentIds.inventory++,
        pharmacyId: 2,
        drugId: 3,
        quantity: 60,
        lastUpdated: new Date(),
      },
      {
        id: this.currentIds.inventory++,
        pharmacyId: 3,
        drugId: 1,
        quantity: 200,
        lastUpdated: new Date(),
      },
    ];

    sampleInventory.forEach(inv => this.inventory.set(inv.id, inv));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      ...insertUser,
      id: this.currentIds.users++,
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Drugs
  async getDrug(id: number): Promise<Drug | undefined> {
    return this.drugs.get(id);
  }

  async getDrugByBatchNumber(batchNumber: string): Promise<Drug | undefined> {
    return Array.from(this.drugs.values()).find(drug => drug.batchNumber === batchNumber);
  }

  async getAllDrugs(): Promise<Drug[]> {
    return Array.from(this.drugs.values());
  }

  async createDrug(insertDrug: InsertDrug): Promise<Drug> {
    const drug: Drug = {
      ...insertDrug,
      id: this.currentIds.drugs++,
      createdAt: new Date(),
      description: insertDrug.description ?? null,
      category: insertDrug.category ?? null,
      strength: insertDrug.strength ?? null,
      qrCodeUrl: insertDrug.qrCodeUrl ?? null,
      isCounterfeit: insertDrug.isCounterfeit ?? false,
    };
    this.drugs.set(drug.id, drug);
    return drug;
  }

  async updateDrug(id: number, drugUpdate: Partial<InsertDrug>): Promise<Drug | undefined> {
    const drug = this.drugs.get(id);
    if (!drug) return undefined;
    
    const updatedDrug = { ...drug, ...drugUpdate };
    this.drugs.set(id, updatedDrug);
    return updatedDrug;
  }

  async deleteDrug(id: number): Promise<boolean> {
    return this.drugs.delete(id);
  }

  // Pharmacies
  async getPharmacy(id: number): Promise<Pharmacy | undefined> {
    return this.pharmacies.get(id);
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    return Array.from(this.pharmacies.values());
  }

  async getPharmaciesByCity(city: string): Promise<Pharmacy[]> {
    return Array.from(this.pharmacies.values()).filter(
      pharmacy => pharmacy.city.toLowerCase() === city.toLowerCase()
    );
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const pharmacy: Pharmacy = {
      ...insertPharmacy,
      id: this.currentIds.pharmacies++,
      createdAt: new Date(),
      lat: insertPharmacy.lat ?? null,
      lng: insertPharmacy.lng ?? null,
      userId: insertPharmacy.userId ?? null,
    };
    this.pharmacies.set(pharmacy.id, pharmacy);
    return pharmacy;
  }

  async updatePharmacy(id: number, pharmacyUpdate: Partial<InsertPharmacy>): Promise<Pharmacy | undefined> {
    const pharmacy = this.pharmacies.get(id);
    if (!pharmacy) return undefined;
    
    const updatedPharmacy = { ...pharmacy, ...pharmacyUpdate };
    this.pharmacies.set(id, updatedPharmacy);
    return updatedPharmacy;
  }

  // Inventory
  async getInventory(pharmacyId: number): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]> {
    return Array.from(this.inventory.values())
      .filter(inv => inv.pharmacyId === pharmacyId)
      .map(inv => ({
        ...inv,
        drug: this.drugs.get(inv.drugId)!,
        pharmacy: this.pharmacies.get(inv.pharmacyId)!,
      }))
      .filter(inv => inv.drug && inv.pharmacy);
  }

  async getInventoryByDrug(drugId: number): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]> {
    return Array.from(this.inventory.values())
      .filter(inv => inv.drugId === drugId)
      .map(inv => ({
        ...inv,
        drug: this.drugs.get(inv.drugId)!,
        pharmacy: this.pharmacies.get(inv.pharmacyId)!,
      }))
      .filter(inv => inv.drug && inv.pharmacy);
  }

  async searchInventory(drugName: string, city: string): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]> {
    return Array.from(this.inventory.values())
      .map(inv => ({
        ...inv,
        drug: this.drugs.get(inv.drugId)!,
        pharmacy: this.pharmacies.get(inv.pharmacyId)!,
      }))
      .filter(inv => {
        if (!inv.drug || !inv.pharmacy) return false;
        
        const drugMatch = inv.drug.name.toLowerCase().includes(drugName.toLowerCase());
        const cityMatch = inv.pharmacy.city.toLowerCase().includes(city.toLowerCase());
        
        return drugMatch && cityMatch && inv.quantity > 0;
      });
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const inventory: Inventory = {
      ...insertInventory,
      id: this.currentIds.inventory++,
      lastUpdated: new Date(),
    };
    this.inventory.set(inventory.id, inventory);
    return inventory;
  }

  async updateInventory(id: number, inventoryUpdate: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const inventory = this.inventory.get(id);
    if (!inventory) return undefined;
    
    const updatedInventory = { ...inventory, ...inventoryUpdate, lastUpdated: new Date() };
    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }

  async deleteInventory(id: number): Promise<boolean> {
    return this.inventory.delete(id);
  }

  // Verifications
  async getVerification(id: number): Promise<Verification | undefined> {
    return this.verifications.get(id);
  }

  async getAllVerifications(): Promise<(Verification & { drug: Drug; user?: User })[]> {
    return Array.from(this.verifications.values())
      .map(verification => ({
        ...verification,
        drug: this.drugs.get(verification.drugId)!,
        user: verification.userId ? this.users.get(verification.userId) : undefined,
      }))
      .filter(verification => verification.drug);
  }

  async createVerification(insertVerification: InsertVerification): Promise<Verification> {
    const verification: Verification = {
      ...insertVerification,
      id: this.currentIds.verifications++,
      timestamp: new Date(),
      userId: insertVerification.userId ?? null,
      location: insertVerification.location ?? null,
    };
    this.verifications.set(verification.id, verification);
    return verification;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword
      })
      .returning();
    return user;
  }

  async getDrug(id: number): Promise<Drug | undefined> {
    const [drug] = await db.select().from(drugs).where(eq(drugs.id, id));
    return drug || undefined;
  }

  async getDrugByBatchNumber(batchNumber: string): Promise<Drug | undefined> {
    const [drug] = await db.select().from(drugs).where(eq(drugs.batchNumber, batchNumber));
    return drug || undefined;
  }

  async getAllDrugs(): Promise<Drug[]> {
    return await db.select().from(drugs);
  }

  async createDrug(insertDrug: InsertDrug): Promise<Drug> {
    const [drug] = await db
      .insert(drugs)
      .values(insertDrug)
      .returning();
    return drug;
  }

  async updateDrug(id: number, drugUpdate: Partial<InsertDrug>): Promise<Drug | undefined> {
    const [drug] = await db
      .update(drugs)
      .set(drugUpdate)
      .where(eq(drugs.id, id))
      .returning();
    return drug || undefined;
  }

  async deleteDrug(id: number): Promise<boolean> {
    const result = await db.delete(drugs).where(eq(drugs.id, id));
    return result.rowCount > 0;
  }

  async getPharmacy(id: number): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.id, id));
    return pharmacy || undefined;
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies);
  }

  async getPharmaciesByCity(city: string): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies).where(eq(pharmacies.city, city));
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const [pharmacy] = await db
      .insert(pharmacies)
      .values(insertPharmacy)
      .returning();
    return pharmacy;
  }

  async updatePharmacy(id: number, pharmacyUpdate: Partial<InsertPharmacy>): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db
      .update(pharmacies)
      .set(pharmacyUpdate)
      .where(eq(pharmacies.id, id))
      .returning();
    return pharmacy || undefined;
  }

  async getInventory(pharmacyId: number): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]> {
    return await db
      .select()
      .from(inventory)
      .leftJoin(drugs, eq(inventory.drugId, drugs.id))
      .leftJoin(pharmacies, eq(inventory.pharmacyId, pharmacies.id))
      .where(eq(inventory.pharmacyId, pharmacyId))
      .then(rows => rows.map(row => ({
        ...row.inventory,
        drug: row.drugs!,
        pharmacy: row.pharmacies!,
      })));
  }

  async getInventoryByDrug(drugId: number): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]> {
    return await db
      .select()
      .from(inventory)
      .leftJoin(drugs, eq(inventory.drugId, drugs.id))
      .leftJoin(pharmacies, eq(inventory.pharmacyId, pharmacies.id))
      .where(eq(inventory.drugId, drugId))
      .then(rows => rows.map(row => ({
        ...row.inventory,
        drug: row.drugs!,
        pharmacy: row.pharmacies!,
      })));
  }

  async searchInventory(drugName: string, city: string): Promise<(Inventory & { drug: Drug; pharmacy: Pharmacy })[]> {
    return await db
      .select()
      .from(inventory)
      .leftJoin(drugs, eq(inventory.drugId, drugs.id))
      .leftJoin(pharmacies, eq(inventory.pharmacyId, pharmacies.id))
      .where(and(
        like(drugs.name, `%${drugName}%`),
        like(pharmacies.city, `%${city}%`)
      ))
      .then(rows => rows.map(row => ({
        ...row.inventory,
        drug: row.drugs!,
        pharmacy: row.pharmacies!,
      })));
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const [inventoryItem] = await db
      .insert(inventory)
      .values(insertInventory)
      .returning();
    return inventoryItem;
  }

  async updateInventory(id: number, inventoryUpdate: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const [inventoryItem] = await db
      .update(inventory)
      .set(inventoryUpdate)
      .where(eq(inventory.id, id))
      .returning();
    return inventoryItem || undefined;
  }

  async deleteInventory(id: number): Promise<boolean> {
    const result = await db.delete(inventory).where(eq(inventory.id, id));
    return result.rowCount > 0;
  }

  async getVerification(id: number): Promise<Verification | undefined> {
    const [verification] = await db.select().from(verifications).where(eq(verifications.id, id));
    return verification || undefined;
  }

  async getAllVerifications(): Promise<(Verification & { drug: Drug; user?: User })[]> {
    return await db
      .select()
      .from(verifications)
      .leftJoin(drugs, eq(verifications.drugId, drugs.id))
      .leftJoin(users, eq(verifications.userId, users.id))
      .then(rows => rows.map(row => ({
        ...row.verifications,
        drug: row.drugs!,
        user: row.users || undefined,
      })));
  }

  async createVerification(insertVerification: InsertVerification): Promise<Verification> {
    const [verification] = await db
      .insert(verifications)
      .values(insertVerification)
      .returning();
    return verification;
  }
}

export const storage = new DatabaseStorage();
