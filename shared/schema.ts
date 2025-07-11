import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'patient', 'pharmacy', 'admin'
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const drugs = sqliteTable("drugs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  batchNumber: text("batch_number").notNull().unique(),
  manufacturer: text("manufacturer").notNull(),
  expiryDate: text("expiry_date").notNull(),
  category: text("category"),
  strength: text("strength"),
  description: text("description"),
  qrCodeUrl: text("qr_code_url"),
  isCounterfeit: integer("is_counterfeit", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const pharmacies = sqliteTable("pharmacies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  contact: text("contact").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pharmacyId: integer("pharmacy_id").references(() => pharmacies.id).notNull(),
  drugId: integer("drug_id").references(() => drugs.id).notNull(),
  quantity: integer("quantity").notNull(),
  lastUpdated: text("last_updated").default("CURRENT_TIMESTAMP").notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  drugId: integer("drug_id").references(() => drugs.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  location: text("location"),
  result: text("result").notNull(), // 'genuine', 'counterfeit'
  timestamp: text("timestamp").default("CURRENT_TIMESTAMP").notNull(),
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

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  pharmacy: one(pharmacies, {
    fields: [users.id],
    references: [pharmacies.userId],
  }),
  verifications: many(verifications),
}));

export const drugsRelations = relations(drugs, ({ many }) => ({
  inventory: many(inventory),
  verifications: many(verifications),
}));

export const pharmaciesRelations = relations(pharmacies, ({ one, many }) => ({
  user: one(users, {
    fields: [pharmacies.userId],
    references: [users.id],
  }),
  inventory: many(inventory),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  pharmacy: one(pharmacies, {
    fields: [inventory.pharmacyId],
    references: [pharmacies.id],
  }),
  drug: one(drugs, {
    fields: [inventory.drugId],
    references: [drugs.id],
  }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  drug: one(drugs, {
    fields: [verifications.drugId],
    references: [drugs.id],
  }),
  user: one(users, {
    fields: [verifications.userId],
    references: [users.id],
  }),
}));

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
