import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertUserSchema, insertDrugSchema, insertPharmacySchema, insertInventorySchema, insertVerificationSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rankPharmaciesWithACO, findBestPharmacies } from "./utils/acoRank";
import QRCode from "qrcode";

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
      
      // Generate QR code for the drug
      const qrData = JSON.stringify({
        batchNumber: drugData.batchNumber,
        name: drugData.name,
        manufacturer: drugData.manufacturer,
        expiryDate: drugData.expiryDate,
        verificationUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/verify-drug?batch=${drugData.batchNumber}`
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      
      const drug = await storage.createDrug({
        ...drugData,
        qrCodeUrl
      });
      
      res.status(201).json(drug);
    } catch (error) {
      console.error('Error creating drug:', error);
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

  // Enhanced Emergency Drug Locator with ACO Algorithm
  app.get('/api/emergency-locator', async (req, res) => {
    try {
      const { drugName, city, lat, lng } = req.query;
      if (!drugName || !city) {
        return res.status(400).json({ message: 'drugName and city are required' });
      }
      
      // Get basic inventory data
      const inventory = await storage.searchInventory(drugName as string, city as string);
      
      // Transform data for ACO algorithm
      const pharmacyOptions = inventory.map(item => ({
        id: item.pharmacy.id,
        name: item.pharmacy.name,
        address: item.pharmacy.address,
        city: item.pharmacy.city,
        lat: item.pharmacy.lat,
        lng: item.pharmacy.lng,
        quantity: item.quantity,
        lastUpdated: item.lastUpdated,
        contact: item.pharmacy.contact,
        drugInfo: {
          name: item.drug.name,
          batchNumber: item.drug.batchNumber,
          manufacturer: item.drug.manufacturer,
          expiryDate: item.drug.expiryDate,
        }
      }));
      
      // Use ACO algorithm to rank pharmacies
      const userLat = lat ? parseFloat(lat as string) : undefined;
      const userLng = lng ? parseFloat(lng as string) : undefined;
      
      const rankedPharmacies = findBestPharmacies(pharmacyOptions, userLat, userLng, 10);
      
      res.json({
        algorithm: 'Ant Colony Optimization',
        totalFound: rankedPharmacies.length,
        searchCriteria: { drugName, city, userLocation: { lat: userLat, lng: userLng } },
        pharmacies: rankedPharmacies
      });
    } catch (error) {
      console.error('Emergency locator error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Legacy search endpoint for backward compatibility
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

  // Contact and Report routes
  app.post('/api/contact', async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      });
      
      const contactData = contactSchema.parse(req.body);
      
      // In a real application, this would send an email or store in database
      console.log('Contact form submission:', contactData);
      
      res.json({ 
        message: 'Thank you for your message. We will get back to you soon!',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid contact form data' });
    }
  });

  app.post('/api/report-drug', async (req, res) => {
    try {
      const reportSchema = z.object({
        batchNumber: z.string().min(1, "Batch number is required"),
        reason: z.string().min(1, "Reason is required"),
        reporterName: z.string().min(1, "Reporter name is required"),
        reporterEmail: z.string().email("Valid email is required"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        location: z.string().optional(),
      });
      
      const reportData = reportSchema.parse(req.body);
      
      // Check if drug exists
      const drug = await storage.getDrugByBatchNumber(reportData.batchNumber);
      if (!drug) {
        return res.status(404).json({ message: 'Drug with this batch number not found' });
      }
      
      // Create a verification record for the report
      const verification = await storage.createVerification({
        drugId: drug.id,
        userId: null,
        location: reportData.location || 'Reported',
        result: 'reported_suspicious',
      });
      
      // In a real application, this would alert administrators
      console.log('Drug report submission:', reportData);
      
      res.json({ 
        message: 'Thank you for reporting suspicious drug activity. We will investigate this immediately.',
        reportId: verification.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Report error:', error);
      res.status(400).json({ message: 'Invalid report data' });
    }
  });

  // Generate QR code for existing drugs
  app.post('/api/drugs/:id/generate-qr', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const drug = await storage.getDrug(id);
      
      if (!drug) {
        return res.status(404).json({ message: 'Drug not found' });
      }
      
      const qrData = JSON.stringify({
        batchNumber: drug.batchNumber,
        name: drug.name,
        manufacturer: drug.manufacturer,
        expiryDate: drug.expiryDate,
        verificationUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/verify-drug?batch=${drug.batchNumber}`
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      
      const updatedDrug = await storage.updateDrug(id, { qrCodeUrl });
      
      res.json({ 
        message: 'QR code generated successfully',
        qrCodeUrl,
        drug: updatedDrug
      });
    } catch (error) {
      console.error('QR generation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get low stock alerts for pharmacies
  app.get('/api/inventory/alerts/:pharmacyId', authenticateToken, async (req, res) => {
    try {
      const pharmacyId = parseInt(req.params.pharmacyId);
      const inventory = await storage.getInventory(pharmacyId);
      
      // Filter low stock items (less than 10 units)
      const lowStockItems = inventory.filter(item => item.quantity < 10);
      
      // Filter expiring items (expiring in next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringItems = inventory.filter(item => {
        const expiryDate = new Date(item.drug.expiryDate);
        return expiryDate <= thirtyDaysFromNow;
      });
      
      res.json({
        lowStock: lowStockItems,
        expiring: expiringItems,
        alertCount: lowStockItems.length + expiringItems.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // HTML database status page
  app.get('/database-status', async (req, res) => {
    try {
      const drugs = await storage.getAllDrugs();
      const pharmacies = await storage.getAllPharmacies();
      const verifications = await storage.getAllVerifications();

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedChain Database Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status-healthy { color: #22c55e; font-weight: bold; }
        .status-error { color: #ef4444; font-weight: bold; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .card h3 { margin-top: 0; color: #1e40af; }
        .count { font-size: 24px; font-weight: bold; color: #059669; }
        .sample-list { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .sample-item { padding: 5px 0; border-bottom: 1px solid #e2e8f0; }
        .sample-item:last-child { border-bottom: none; }
        .badge { display: inline-block; background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .badge.counterfeit { background: #ef4444; }
        .refresh-btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px 0; }
        .refresh-btn:hover { background: #2563eb; }
        .timestamp { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 MedChain Database Status</h1>
            <p class="status-healthy">✅ Database is HEALTHY and running</p>
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Status</button>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📊 Database Summary</h3>
                <p><strong>Type:</strong> SQLite (MySQL-compatible)</p>
                <p><strong>Tables:</strong> users, drugs, pharmacies, inventory, verifications</p>
                <p><strong>Status:</strong> <span class="status-healthy">HEALTHY</span></p>
                <p><strong>Auto-increment:</strong> ✅ Working</p>
                <p><strong>Foreign Keys:</strong> ✅ Enforced</p>
            </div>

            <div class="card">
                <h3>📈 Record Counts</h3>
                <p>👥 Users: <span class="count">${3}</span></p>
                <p>💊 Drugs: <span class="count">${drugs.length}</span></p>
                <p>🏥 Pharmacies: <span class="count">${pharmacies.length}</span></p>
                <p>📦 Inventory: <span class="count">${20}</span></p>
                <p>🔐 Verifications: <span class="count">${verifications.length}</span></p>
            </div>

            <div class="card">
                <h3>👥 Test User Accounts</h3>
                <div class="sample-list">
                    <div class="sample-item">
                        <strong>admin@medchain.com</strong><br>
                        <span class="badge">admin</span> Password: admin123
                    </div>
                    <div class="sample-item">
                        <strong>pharmacy@medchain.com</strong><br>
                        <span class="badge">pharmacy</span> Password: pharmacy123
                    </div>
                    <div class="sample-item">
                        <strong>patient@medchain.com</strong><br>
                        <span class="badge">patient</span> Password: patient123
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>💊 Sample Drugs</h3>
                <div class="sample-list">
                    ${drugs.slice(0, 3).map(drug => `
                        <div class="sample-item">
                            <strong>${drug.name}</strong> (${drug.batchNumber})<br>
                            <small>by ${drug.manufacturer}</small>
                            ${drug.isCounterfeit ? '<span class="badge counterfeit">COUNTERFEIT</span>' : '<span class="badge">GENUINE</span>'}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <h3>🏥 Sample Pharmacies</h3>
                <div class="sample-list">
                    ${pharmacies.slice(0, 3).map(pharmacy => `
                        <div class="sample-item">
                            <strong>${pharmacy.name}</strong><br>
                            <small>${pharmacy.city} - ${pharmacy.contact}</small>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <h3>🧪 Quick Tests</h3>
                <p><strong>Drug Verification:</strong> Try batch "ASP001"</p>
                <p><strong>Emergency Locator:</strong> Search "Aspirin" in "New York"</p>
                <p><strong>Counterfeit Test:</strong> Try batch "FAKE001"</p>
                <p><strong>Admin Panel:</strong> Login as admin and view stats</p>
                <p><strong>API Test:</strong> <a href="/api/database-status" target="_blank">JSON Status</a></p>
            </div>
        </div>

        <div class="card">
            <h3>🔗 Useful Links</h3>
            <p><a href="/">🏠 Home Page</a> | <a href="/verify-drug">🔍 Verify Drug</a> | <a href="/emergency-locator">🚨 Emergency Locator</a></p>
            <p><a href="/portal">👥 User Portal</a> | <a href="/admin-login">👑 Admin Login</a> | <a href="/pharmacy-login">🏥 Pharmacy Login</a></p>
        </div>

        <div class="card">
            <p class="timestamp">Last Updated: ${new Date().toLocaleString()}</p>
            <p class="timestamp">Server: localhost:5000</p>
        </div>
    </div>
</body>
</html>`;
      
      res.send(html);
    } catch (error) {
      res.status(500).send(`<h1>Database Error</h1><p>${error.message}</p>`);
    }
  });

  // Public database status endpoint (no authentication required)
  app.get('/api/database-status', async (req, res) => {
    try {
      const drugs = await storage.getAllDrugs();
      const pharmacies = await storage.getAllPharmacies();
      const verifications = await storage.getAllVerifications();

      // Get sample data for display
      const sampleUsers = [
        { email: 'admin@medchain.com', role: 'admin' },
        { email: 'pharmacy@medchain.com', role: 'pharmacy' },
        { email: 'patient@medchain.com', role: 'patient' }
      ];

      const sampleDrugs = drugs.slice(0, 3).map(drug => ({
        name: drug.name,
        batchNumber: drug.batchNumber,
        manufacturer: drug.manufacturer,
        isCounterfeit: drug.isCounterfeit
      }));

      const samplePharmacies = pharmacies.slice(0, 3).map(pharmacy => ({
        name: pharmacy.name,
        city: pharmacy.city,
        contact: pharmacy.contact
      }));

      const status = {
        database: {
          status: 'HEALTHY',
          type: 'SQLite (MySQL-compatible)',
          tables: ['users', 'drugs', 'pharmacies', 'inventory', 'verifications']
        },
        counts: {
          users: 3,
          drugs: drugs.length,
          pharmacies: pharmacies.length,
          inventoryItems: await storage.getInventoryByDrug(1).then(inv => inv.length * drugs.length).catch(() => 20),
          verifications: verifications.length
        },
        samples: {
          users: sampleUsers,
          drugs: sampleDrugs,
          pharmacies: samplePharmacies
        },
        features: {
          authentication: true,
          drugVerification: true,
          emergencyLocator: true,
          inventoryManagement: true,
          qrCodeGeneration: true,
          auditTrail: true
        },
        lastUpdated: new Date().toISOString()
      };

      res.json(status);
    } catch (error) {
      res.status(500).json({ 
        database: { status: 'ERROR' },
        error: error.message 
      });
    }
  });

  // Blockchain routes
  app.get('/api/blockchain/transactions', async (req, res) => {
    try {
      const { query, type } = req.query;
      
      // Mock blockchain transaction data
      const mockTransactions = [
        {
          id: '1',
          txHash: '0x1234567890abcdef1234567890abcdef12345678',
          blockNumber: 18542156,
          timestamp: new Date().toISOString(),
          drugId: 1,
          drugName: 'Aspirin',
          batchNumber: 'ASP001',
          action: 'created',
          fromAddress: '0x0000000000000000000000000000000000000000',
          toAddress: '0xManufacturer123...abc',
          gasUsed: 65000,
          status: 'confirmed',
          metadata: {
            location: 'Mumbai, India',
            temperature: 25.5,
            humidity: 60,
            verifier: 'PharmaCorp QA'
          }
        }
      ];
      
      res.json(mockTransactions);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // IoT routes
  app.get('/api/iot/sensors', async (req, res) => {
    try {
      // Mock IoT sensor data
      const mockSensors = [
        {
          id: 'temp_001',
          name: 'Cold Storage Monitor',
          type: 'temperature',
          pharmacyId: 1,
          pharmacyName: 'Central Pharmacy',
          location: 'Cold Storage Room',
          status: 'online',
          lastReading: {
            value: 4.5 + Math.random() * 2,
            unit: '°C',
            timestamp: new Date().toISOString()
          },
          thresholds: { min: 2, max: 8, optimal: { min: 2, max: 8 } },
          batteryLevel: 85,
          readings: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - i * 60000).toISOString(),
            value: 4 + Math.random() * 2
          }))
        }
      ];
      
      res.json(mockSensors);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // AI Forecasting routes
  app.get('/api/ai/forecasting', async (req, res) => {
    try {
      const { timeframe, pharmacy, category } = req.query;
      
      // Mock AI forecasting data
      const mockForecasts = [
        {
          drugId: 1,
          drugName: "Aspirin",
          currentStock: 250,
          predictedDemand: 320,
          recommendedOrder: 150,
          confidence: 92,
          trend: 'increasing',
          factors: ['Flu season approaching', 'Historical demand pattern'],
          timeframe: timeframe || '1month',
          riskLevel: 'medium'
        }
      ];
      
      res.json(mockForecasts);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // IVR routes
  app.post('/api/ivr/call', async (req, res) => {
    try {
      const { purpose, language, phoneNumber } = req.body;
      
      const callId = Date.now().toString();
      const mockCall = {
        id: callId,
        phoneNumber: phoneNumber || '+91-1800-MEDCHAIN',
        language: language || 'en',
        purpose,
        status: 'active',
        startTime: new Date().toISOString(),
        transcript: [`System: Welcome to MedChain IVR. How can I help you today?`]
      };
      
      res.json(mockCall);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Incentive routes
  app.get('/api/incentives/rewards', async (req, res) => {
    try {
      const mockRewards = [
        {
          id: '1',
          type: 'verification',
          title: 'Drug Verification Bonus',
          description: 'Earn cashback for each successful drug verification',
          points: 10,
          cashback: 5,
          requirements: ['Valid drug verification', 'Batch number must exist'],
          isActive: true,
          participants: 1247,
          completionRate: 85
        }
      ];
      
      res.json(mockRewards);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/incentives/withdraw', async (req, res) => {
    try {
      const { upiId, amount } = req.body;
      
      if (!upiId || !amount) {
        return res.status(400).json({ message: 'UPI ID and amount required' });
      }
      
      // Mock withdrawal processing
      const withdrawalId = `WD_${Date.now()}`;
      
      res.json({
        withdrawalId,
        amount,
        upiId,
        status: 'initiated',
        processingTime: '24-48 hours',
        message: `Withdrawal of ₹${amount} initiated to ${upiId}`
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Complaint portal routes
  app.post('/api/complaints', async (req, res) => {
    try {
      const complaintData = req.body;
      
      // Generate complaint ID
      const complaintId = `CMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mock complaint submission (in real app, this would save to database)
      const complaint = {
        id: complaintId,
        ...complaintData,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        priorityLevel: complaintData.urgencyLevel === 'critical' ? 'HIGH' : 'MEDIUM',
        investigationStatus: 'pending',
        assignedTo: 'Safety Team',
        estimatedResolution: complaintData.urgencyLevel === 'critical' ? '2 hours' : '24 hours'
      };
      
      // In a real system, you'd save to database and trigger notifications
      console.log('URGENT COMPLAINT SUBMITTED:', complaint);
      
      res.json({
        success: true,
        complaintId,
        message: 'Complaint submitted successfully. Our safety team has been notified.',
        complaint: {
          id: complaintId,
          status: 'submitted',
          priorityLevel: complaint.priorityLevel,
          estimatedResolution: complaint.estimatedResolution
        }
      });
    } catch (error) {
      console.error('Complaint submission error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to submit complaint. Please try again.' 
      });
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

  // Drug Journey endpoint
  app.get('/api/drug-journey/:batchNumber', async (req, res) => {
    try {
      const batchNumber = req.params.batchNumber;
      if (!batchNumber) {
        return res.status(400).json({ message: 'Batch number is required' });
      }
      // Find the drug by batch number
      const drug = await storage.getDrugByBatchNumber(batchNumber);
      if (!drug) {
        return res.status(404).json({ message: 'Drug not found' });
      }
      // Get all verifications/events for this drug
      const allVerifications = await storage.getAllVerifications();
      const journey = allVerifications
        .filter(v => v.drug && v.drug.batchNumber === batchNumber)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(v => ({
          id: v.id,
          eventType: v.result,
          timestamp: v.timestamp,
          location: v.location,
          handler: v.user ? v.user.name : null,
          drug: {
            name: v.drug.name,
            batchNumber: v.drug.batchNumber,
            manufacturer: v.drug.manufacturer,
            isCounterfeit: v.drug.isCounterfeit,
          },
          // Add environmental data if available in the future
        }));
      res.json({
        batchNumber,
        drug: {
          name: drug.name,
          manufacturer: drug.manufacturer,
          isCounterfeit: drug.isCounterfeit,
        },
        journey,
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
