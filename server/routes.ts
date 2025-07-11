import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertUserSchema, insertDrugSchema, insertPharmacySchema, insertInventorySchema, insertVerificationSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to check pharmacy role
const requirePharmacy = (req: any, res: any, next: any) => {
  if (req.user.role !== 'pharmacy') {
    return res.status(403).json({ message: 'Pharmacy access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Drug routes
  app.get('/api/drugs', async (req, res) => {
    try {
      const drugs = await storage.getAllDrugs();
      res.json(drugs);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/drugs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const drug = await storage.getDrug(id);
      if (!drug) {
        return res.status(404).json({ message: 'Drug not found' });
      }
      res.json(drug);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/drugs/batch/:batchNumber', async (req, res) => {
    try {
      const batchNumber = req.params.batchNumber;
      const drug = await storage.getDrugByBatchNumber(batchNumber);
      if (!drug) {
        return res.status(404).json({ message: 'Drug not found' });
      }
      res.json(drug);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/drugs', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const drugData = insertDrugSchema.parse(req.body);
      const drug = await storage.createDrug(drugData);
      res.status(201).json(drug);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.put('/api/drugs/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const drugData = insertDrugSchema.partial().parse(req.body);
      const drug = await storage.updateDrug(id, drugData);
      if (!drug) {
        return res.status(404).json({ message: 'Drug not found' });
      }
      res.json(drug);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.delete('/api/drugs/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDrug(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Drug not found' });
      }
      res.json({ message: 'Drug deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Pharmacy routes
  app.get('/api/pharmacies', async (req, res) => {
    try {
      const pharmacies = await storage.getAllPharmacies();
      res.json(pharmacies);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/pharmacies/city/:city', async (req, res) => {
    try {
      const city = req.params.city;
      const pharmacies = await storage.getPharmaciesByCity(city);
      res.json(pharmacies);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/pharmacies', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const pharmacyData = insertPharmacySchema.parse(req.body);
      const pharmacy = await storage.createPharmacy(pharmacyData);
      res.status(201).json(pharmacy);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Inventory routes
  app.get('/api/inventory/pharmacy/:pharmacyId', authenticateToken, async (req, res) => {
    try {
      const pharmacyId = parseInt(req.params.pharmacyId);
      const inventory = await storage.getInventory(pharmacyId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/inventory/search', async (req, res) => {
    try {
      const { drugName, city } = req.query;
      if (!drugName || !city) {
        return res.status(400).json({ message: 'drugName and city are required' });
      }
      
      const inventory = await storage.searchInventory(drugName as string, city as string);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/inventory', authenticateToken, requirePharmacy, async (req, res) => {
    try {
      const inventoryData = insertInventorySchema.parse(req.body);
      const inventory = await storage.createInventory(inventoryData);
      res.status(201).json(inventory);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.put('/api/inventory/:id', authenticateToken, requirePharmacy, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inventoryData = insertInventorySchema.partial().parse(req.body);
      const inventory = await storage.updateInventory(id, inventoryData);
      if (!inventory) {
        return res.status(404).json({ message: 'Inventory not found' });
      }
      res.json(inventory);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  // Verification routes
  app.get('/api/verifications', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const verifications = await storage.getAllVerifications();
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/verifications', async (req, res) => {
    try {
      const verificationData = insertVerificationSchema.parse(req.body);
      const verification = await storage.createVerification(verificationData);
      res.status(201).json(verification);
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/verify-drug', async (req, res) => {
    try {
      const { batchNumber } = req.body;
      if (!batchNumber) {
        return res.status(400).json({ message: 'Batch number is required' });
      }

      const drug = await storage.getDrugByBatchNumber(batchNumber);
      if (!drug) {
        return res.status(404).json({ message: 'Drug not found' });
      }

      const result = drug.isCounterfeit ? 'counterfeit' : 'genuine';
      
      // Create verification record
      const verification = await storage.createVerification({
        drugId: drug.id,
        userId: null,
        location: 'Unknown',
        result,
      });

      res.json({
        drug,
        result,
        verification: {
          id: verification.id,
          timestamp: verification.timestamp,
          blockchainTx: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Stats routes
  app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
      const drugs = await storage.getAllDrugs();
      const pharmacies = await storage.getAllPharmacies();
      const verifications = await storage.getAllVerifications();

      const stats = {
        totalDrugs: drugs.length,
        activePharmacies: pharmacies.length,
        verificationsToday: verifications.filter(v => {
          const today = new Date();
          const vDate = new Date(v.timestamp);
          return vDate.toDateString() === today.toDateString();
        }).length,
        counterfeitsDetected: verifications.filter(v => v.result === 'counterfeit').length,
        drugsVerified: verifications.length,
        pharmaciesConnected: pharmacies.length,
        citiesCovered: [...new Set(pharmacies.map(p => p.city))].length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
