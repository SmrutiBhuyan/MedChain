import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'patient', 'pharmacy', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drugs = pgTable("drugs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  batchNumber: text("batch_number").notNull().unique(),
  manufacturer: text("manufacturer").notNull(),
  expiryDate: text("expiry_date").notNull(),
  category: text("category"),
  strength: text("strength"),
  description: text("description"),
  qrCodeUrl: text("qr_code_url"),
  isCounterfeit: boolean("is_counterfeit").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  contact: text("contact").notNull(),
  lat: decimal("lat"),
  lng: decimal("lng"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  drugId: integer("drug_id").references(() => drugs.id).notNull(),
  quantity: integer("quantity").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  drugId: integer("drug_id").references(() => drugs.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  location: text("location"),
  result: text("result").notNull(), // 'genuine', 'counterfeit'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDrugSchema = createInsertSchema(drugs).omit({
  id: true,
  createdAt: true,
});

export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
  timestamp: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Types
export type User = typeof users.$inferSelect;
export type Drug = typeof drugs.$inferSelect;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type Verification = typeof verifications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDrug = z.infer<typeof insertDrugSchema>;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
