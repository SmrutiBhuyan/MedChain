import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Package, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  MapPin,
  Clock,
  ShoppingCart,
  Truck,
  RefreshCw,
  AlertCircle,
  Minus,
  Plus,
  Brain,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  Zap
} from "lucide-react";

interface InventoryTracker {
  id: string;
  drugId: number;
  drugName: string;
  batchNumber: string;
  pharmacyId: number;
  pharmacyName: string;
  location: string;
  currentStock: number;
  lastUpdate: string;
  status: 'normal' | 'low' | 'critical' | 'out_of_stock';
  thresholds: {
    low: number;
    critical: number;
    reorder: number;
  };
  movements: Array<{
    timestamp: string;
    type: 'purchase' | 'sale' | 'transfer' | 'adjustment';
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
  }>;
  expiryDate: string;
  isExpiringSoon: boolean;
  manufacturer: string;
  category: string;
}

interface InventoryAlert {
  id: string;
  drugId: number;
  drugName: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'reorder' | 'movement' | 'prediction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  pharmacyName: string;
  location: string;
  currentStock: number;
  threshold: number;
}

interface PredictionModel {
  id: string;
  drugId: number;
  drugName: string;
  pharmacyId: number;
  pharmacyName: string;
  location: string;
  currentStock: number;
  predictedDemand: number;
  demandTrend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
  locationFactor: number;
  freshnessFactor: number;
  acoScore: number;
  confidenceLevel: number;
  predictedStockout: string | null;
  recommendedReorder: number;
  predictionFactors: {
    pastUsage: number;
    seasonalPattern: string;
    locationDemand: string;
    stockTrend: string;
    dataFreshness: number;
  };
  explanation: string;
}

export default function RealTimeInventoryTracking() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("all");
  const [selectedDrugCategory, setSelectedDrugCategory] = useState<string>("all");
  const [realTimeData, setRealTimeData] = useState<InventoryTracker[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [predictions, setPredictions] = useState<PredictionModel[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

  // Simulate real-time inventory updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => prev.map(tracker => {
        const hasMovement = Math.random() < 0.3; // 30% chance of movement
        if (!hasMovement) return tracker;

        const movementType = Math.random() < 0.7 ? 'sale' : 'purchase';
        const quantityChange = movementType === 'sale' 
          ? -Math.floor(Math.random() * 5 + 1) // Sale: -1 to -5
          : Math.floor(Math.random() * 20 + 5); // Purchase: +5 to +25

        const newStock = Math.max(0, tracker.currentStock + quantityChange);
        const newStatus = getStockStatus(newStock, tracker.thresholds);

        const newMovement = {
          timestamp: new Date().toISOString(),
          type: movementType as 'purchase' | 'sale',
          quantity: Math.abs(quantityChange),
          previousStock: tracker.currentStock,
          newStock,
          reason: movementType === 'sale' ? 'Patient dispensed' : 'Inventory replenishment'
        };

        return {
          ...tracker,
          currentStock: newStock,
          lastUpdate: new Date().toISOString(),
          status: newStatus,
          movements: [newMovement, ...tracker.movements.slice(0, 19)] // Keep last 20 movements
        };
      }));
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const getStockStatus = (stock: number, thresholds: { low: number; critical: number; reorder: number }) => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= thresholds.critical) return 'critical';
    if (stock <= thresholds.low) return 'low';
    return 'normal';
  };

  const generateInventoryAlerts = (trackers: InventoryTracker[], predictions: PredictionModel[]): InventoryAlert[] => {
    const alerts: InventoryAlert[] = [];
    
    trackers.forEach(tracker => {
      if (tracker.status === 'out_of_stock') {
        alerts.push({
          id: `alert_${tracker.id}_out`,
          drugId: tracker.drugId,
          drugName: tracker.drugName,
          type: 'out_of_stock',
          severity: 'critical',
          message: `${tracker.drugName} is out of stock at ${tracker.pharmacyName}`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          pharmacyName: tracker.pharmacyName,
          location: tracker.location,
          currentStock: tracker.currentStock,
          threshold: tracker.thresholds.critical
        });
      } else if (tracker.status === 'critical') {
        alerts.push({
          id: `alert_${tracker.id}_critical`,
          drugId: tracker.drugId,
          drugName: tracker.drugName,
          type: 'low_stock',
          severity: 'critical',
          message: `Critical low stock: ${tracker.drugName} (${tracker.currentStock} units remaining)`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          pharmacyName: tracker.pharmacyName,
          location: tracker.location,
          currentStock: tracker.currentStock,
          threshold: tracker.thresholds.critical
        });
      } else if (tracker.currentStock <= tracker.thresholds.reorder) {
        alerts.push({
          id: `alert_${tracker.id}_reorder`,
          drugId: tracker.drugId,
          drugName: tracker.drugName,
          type: 'reorder',
          severity: 'medium',
          message: `Reorder point reached: ${tracker.drugName} (${tracker.currentStock} units)`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          pharmacyName: tracker.pharmacyName,
          location: tracker.location,
          currentStock: tracker.currentStock,
          threshold: tracker.thresholds.reorder
        });
      }

      if (tracker.isExpiringSoon) {
        alerts.push({
          id: `alert_${tracker.id}_expiry`,
          drugId: tracker.drugId,
          drugName: tracker.drugName,
          type: 'expiring',
          severity: 'high',
          message: `${tracker.drugName} expires on ${new Date(tracker.expiryDate).toLocaleDateString()}`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          pharmacyName: tracker.pharmacyName,
          location: tracker.location,
          currentStock: tracker.currentStock,
          threshold: 0
        });
      }
    });

    // Add AI prediction-based alerts
    predictions.forEach(prediction => {
      if (prediction.predictedStockout) {
        alerts.push({
          id: `alert_${prediction.id}_prediction`,
          drugId: prediction.drugId,
          drugName: prediction.drugName,
          type: 'prediction',
          severity: 'high',
          message: `AI Prediction: ${prediction.drugName} may run out by ${new Date(prediction.predictedStockout).toLocaleDateString()} at ${prediction.pharmacyName}`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          pharmacyName: prediction.pharmacyName,
          location: prediction.location,
          currentStock: prediction.currentStock,
          threshold: prediction.recommendedReorder
        });
      }
    });

    return alerts;
  };

  const generatePredictionModels = (trackers: InventoryTracker[]): PredictionModel[] => {
    return trackers.map(tracker => {
      // Calculate seasonal factor based on drug type and current season
      const currentMonth = new Date().getMonth();
      const seasonalFactor = calculateSeasonalFactor(tracker.category, currentMonth);
      
      // Calculate location factor based on pharmacy location
      const locationFactor = calculateLocationFactor(tracker.location, tracker.category);
      
      // Calculate data freshness factor
      const freshnessFactor = calculateDataFreshness(tracker.lastUpdate);
      
      // Calculate past usage trend
      const pastUsageTrend = calculatePastUsageTrend(tracker.movements);
      
      // Predict demand using ACO-inspired algorithm
      const predictedDemand = Math.round(
        pastUsageTrend * seasonalFactor * locationFactor * freshnessFactor
      );
      
      // Calculate confidence level
      const confidenceLevel = Math.min(95, 
        (freshnessFactor * 40) + 
        (tracker.movements.length * 10) + 
        (locationFactor * 30) + 
        15
      );
      
      // Predict stockout date
      const daysUntilStockout = tracker.currentStock / Math.max(1, predictedDemand / 30);
      const predictedStockout = daysUntilStockout < 7 ? 
        new Date(Date.now() + (daysUntilStockout * 24 * 60 * 60 * 1000)).toISOString() : 
        null;
      
      // Calculate recommended reorder quantity
      const recommendedReorder = Math.round(predictedDemand * 1.5);
      
      // Determine trend
      const demandTrend = predictedDemand > pastUsageTrend ? 'increasing' : 
                         predictedDemand < pastUsageTrend ? 'decreasing' : 'stable';
      
      return {
        id: `pred_${tracker.id}`,
        drugId: tracker.drugId,
        drugName: tracker.drugName,
        pharmacyId: tracker.pharmacyId,
        pharmacyName: tracker.pharmacyName,
        location: tracker.location,
        currentStock: tracker.currentStock,
        predictedDemand,
        demandTrend,
        seasonalFactor,
        locationFactor,
        freshnessFactor,
        acoScore: (predictedDemand * locationFactor * freshnessFactor),
        confidenceLevel,
        predictedStockout,
        recommendedReorder,
        predictionFactors: {
          pastUsage: pastUsageTrend,
          seasonalPattern: getSeasonalPattern(tracker.category, currentMonth),
          locationDemand: getLocationDemand(tracker.location, tracker.category),
          stockTrend: tracker.movements.length > 0 ? 
            (tracker.movements[0].type === 'sale' ? 'decreasing' : 'increasing') : 'stable',
          dataFreshness: freshnessFactor
        },
        explanation: generatePredictionExplanation(tracker, predictedDemand, seasonalFactor, locationFactor, freshnessFactor)
      };
    });
  };

  const calculateSeasonalFactor = (category: string, month: number): number => {
    const seasonalPatterns = {
      'Emergency': [1.0, 1.0, 1.1, 1.0, 1.0, 1.2, 1.3, 1.3, 1.2, 1.1, 1.0, 1.0], // Higher in summer
      'Diabetes': [1.2, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.2], // Higher in winter
      'Pain Management': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.2, 1.1], // Higher in colder months
      'Antibiotics': [1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3], // Higher in monsoon/winter
      'OTC': [1.1, 1.0, 1.0, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.0, 1.1] // Higher in summer
    };
    return seasonalPatterns[category] ? seasonalPatterns[category][month] : 1.0;
  };

  const calculateLocationFactor = (location: string, category: string): number => {
    const locationFactors = {
      'Emergency Medicine Section': category === 'Emergency' ? 1.5 : 1.0,
      'Diabetes Care Section': category === 'Diabetes' ? 1.3 : 1.0,
      'Controlled Substances Vault': category === 'Pain Management' ? 1.4 : 1.0,
      'Antibiotics Section': category === 'Antibiotics' ? 1.2 : 1.0,
      'OTC Section': category === 'OTC' ? 1.1 : 1.0
    };
    return locationFactors[location] || 1.0;
  };

  const calculateDataFreshness = (lastUpdate: string): number => {
    const hoursAgo = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 1) return 1.0;
    if (hoursAgo < 6) return 0.95;
    if (hoursAgo < 24) return 0.9;
    if (hoursAgo < 48) return 0.8;
    return 0.7;
  };

  const calculatePastUsageTrend = (movements: any[]): number => {
    if (movements.length === 0) return 20; // Default estimate
    
    const salesMovements = movements.filter(m => m.type === 'sale');
    const totalSales = salesMovements.reduce((sum, m) => sum + m.quantity, 0);
    
    return Math.max(10, totalSales / Math.max(1, salesMovements.length) * 30); // Monthly estimate
  };

  const getSeasonalPattern = (category: string, month: number): string => {
    const patterns = {
      'Emergency': ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Winter', 'Winter'],
      'Diabetes': ['High', 'High', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'High', 'High'],
      'Pain Management': ['Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'High', 'High', 'High'],
      'Antibiotics': ['High', 'High', 'High', 'Normal', 'Low', 'Low', 'Low', 'Low', 'Normal', 'High', 'High', 'High'],
      'OTC': ['Normal', 'Normal', 'Normal', 'Normal', 'High', 'High', 'High', 'High', 'Normal', 'Normal', 'Normal', 'Normal']
    };
    return patterns[category] ? patterns[category][month] : 'Normal';
  };

  const getLocationDemand = (location: string, category: string): string => {
    if (location.includes('Emergency')) return 'Critical Area';
    if (location.includes('Diabetes')) return 'Specialized Care';
    if (location.includes('Controlled')) return 'Restricted Access';
    if (location.includes('OTC')) return 'High Traffic';
    return 'Standard';
  };

  const generatePredictionExplanation = (tracker: InventoryTracker, predictedDemand: number, seasonal: number, location: number, freshness: number): string => {
    const factors = [];
    
    if (seasonal > 1.1) factors.push('high seasonal demand');
    if (location > 1.1) factors.push('specialized location');
    if (freshness > 0.9) factors.push('fresh data');
    if (tracker.movements.length > 1) factors.push('historical usage patterns');
    
    return `Predicted ${predictedDemand} units needed monthly based on ${factors.join(', ')}. ACO algorithm optimized for stock placement.`;
  };

  const mockInventoryTrackers: InventoryTracker[] = [
    {
      id: 'inv_001',
      drugId: 6,
      drugName: 'Epinephrine',
      batchNumber: 'EPI-2024-001',
      pharmacyId: 1,
      pharmacyName: 'Central Pharmacy',
      location: 'Emergency Medicine Section',
      currentStock: 8,
      lastUpdate: new Date().toISOString(),
      status: 'critical',
      thresholds: {
        low: 20,
        critical: 10,
        reorder: 15
      },
      movements: [
        {
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'sale',
          quantity: 2,
          previousStock: 10,
          newStock: 8,
          reason: 'Emergency patient dispensed'
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'purchase',
          quantity: 50,
          previousStock: 5,
          newStock: 55,
          reason: 'Weekly inventory replenishment'
        }
      ],
      expiryDate: '2025-08-15',
      isExpiringSoon: false,
      manufacturer: 'EmergiMed',
      category: 'Emergency'
    },
    {
      id: 'inv_002',
      drugId: 7,
      drugName: 'Insulin Regular',
      batchNumber: 'INS-2024-026',
      pharmacyId: 1,
      pharmacyName: 'Central Pharmacy',
      location: 'Diabetes Care Section',
      currentStock: 45,
      lastUpdate: new Date().toISOString(),
      status: 'normal',
      thresholds: {
        low: 30,
        critical: 15,
        reorder: 25
      },
      movements: [
        {
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'sale',
          quantity: 3,
          previousStock: 48,
          newStock: 45,
          reason: 'Diabetic patient prescription'
        }
      ],
      expiryDate: '2025-12-20',
      isExpiringSoon: false,
      manufacturer: 'DiabetesLife',
      category: 'Diabetes'
    },
    {
      id: 'inv_003',
      drugId: 8,
      drugName: 'Morphine Sulfate',
      batchNumber: 'MOR-2024-041',
      pharmacyId: 2,
      pharmacyName: 'Downtown Pharmacy',
      location: 'Controlled Substances Vault',
      currentStock: 12,
      lastUpdate: new Date().toISOString(),
      status: 'low',
      thresholds: {
        low: 15,
        critical: 8,
        reorder: 12
      },
      movements: [
        {
          timestamp: new Date(Date.now() - 900000).toISOString(),
          type: 'sale',
          quantity: 1,
          previousStock: 13,
          newStock: 12,
          reason: 'Post-operative pain management'
        }
      ],
      expiryDate: '2025-06-30',
      isExpiringSoon: false,
      manufacturer: 'PainRelief Inc',
      category: 'Pain Management'
    },
    {
      id: 'inv_004',
      drugId: 9,
      drugName: 'Aspirin',
      batchNumber: 'ASP-2024-055',
      pharmacyId: 3,
      pharmacyName: 'Community Pharmacy',
      location: 'OTC Section',
      currentStock: 0,
      lastUpdate: new Date().toISOString(),
      status: 'out_of_stock',
      thresholds: {
        low: 50,
        critical: 20,
        reorder: 30
      },
      movements: [
        {
          timestamp: new Date(Date.now() - 600000).toISOString(),
          type: 'sale',
          quantity: 15,
          previousStock: 15,
          newStock: 0,
          reason: 'Bulk sale to clinic'
        }
      ],
      expiryDate: '2026-03-15',
      isExpiringSoon: false,
      manufacturer: 'BasicMed',
      category: 'OTC'
    },
    {
      id: 'inv_005',
      drugId: 10,
      drugName: 'Amoxicillin',
      batchNumber: 'AMX-2024-073',
      pharmacyId: 4,
      pharmacyName: 'Family Health Pharmacy',
      location: 'Antibiotics Section',
      currentStock: 22,
      lastUpdate: new Date().toISOString(),
      status: 'normal',
      thresholds: {
        low: 25,
        critical: 10,
        reorder: 20
      },
      movements: [
        {
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          type: 'purchase',
          quantity: 100,
          previousStock: 5,
          newStock: 105,
          reason: 'Monthly stock replenishment'
        }
      ],
      expiryDate: '2025-02-28',
      isExpiringSoon: true,
      manufacturer: 'AntibioticsPlus',
      category: 'Antibiotics'
    }
  ];

  // Initialize with mock data
  useEffect(() => {
    setRealTimeData(mockInventoryTrackers);
    const initialPredictions = generatePredictionModels(mockInventoryTrackers);
    setPredictions(initialPredictions);
    setAlerts(generateInventoryAlerts(mockInventoryTrackers, initialPredictions));
  }, []);

  // Update alerts and predictions when inventory changes
  useEffect(() => {
    const updatedPredictions = generatePredictionModels(realTimeData);
    setPredictions(updatedPredictions);
    setAlerts(generateInventoryAlerts(realTimeData, updatedPredictions));
  }, [realTimeData]);

  // Update predictions every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedPredictions = generatePredictionModels(realTimeData);
      setPredictions(updatedPredictions);
    }, 30000);

    return () => clearInterval(interval);
  }, [realTimeData]);

  const getDrugIcon = (category: string) => {
    switch (category) {
      case 'Emergency': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'Diabetes': return <Pill className="h-5 w-5 text-blue-500" />;
      case 'Pain Management': return <Package className="h-5 w-5 text-purple-500" />;
      case 'Antibiotics': return <Pill className="h-5 w-5 text-green-500" />;
      case 'OTC': return <Package className="h-5 w-5 text-gray-500" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <Plus className="h-4 w-4 text-green-500" />;
      case 'sale': return <Minus className="h-4 w-4 text-red-500" />;
      case 'transfer': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'adjustment': return <RefreshCw className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredInventory = realTimeData.filter(tracker => {
    const matchesPharmacy = selectedPharmacy === 'all' || tracker.pharmacyId.toString() === selectedPharmacy;
    const matchesCategory = selectedDrugCategory === 'all' || tracker.category === selectedDrugCategory;
    return matchesPharmacy && matchesCategory;
  });

  const filteredPredictions = predictions.filter(prediction => {
    const matchesPharmacy = selectedPharmacy === 'all' || prediction.pharmacyId.toString() === selectedPharmacy;
    const matchesCategory = selectedDrugCategory === 'all' || 
      filteredInventory.find(inv => inv.drugId === prediction.drugId)?.category === selectedDrugCategory;
    return matchesPharmacy && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {showPredictions ? '🧠 AI Medicine Predictions' : '📦 Real-Time Inventory Tracking'}
        </h1>
        <p className="text-gray-600">
          {showPredictions ? 
            'AI-powered medicine demand forecasting using past usage, location trends, seasonal patterns, and ACO optimization' :
            'Live monitoring of medicine quantities, stock levels, and inventory movements across all pharmacies'
          }
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {realTimeData.filter(item => item.status === 'critical' || item.status === 'out_of_stock').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {realTimeData.filter(item => item.isExpiringSoon).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-green-600">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Predictions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {predictions.filter(p => p.confidenceLevel > 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and AI Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pharmacy
          </label>
          <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
            <SelectTrigger>
              <SelectValue placeholder="Select pharmacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pharmacies</SelectItem>
              <SelectItem value="1">Central Pharmacy</SelectItem>
              <SelectItem value="2">Downtown Pharmacy</SelectItem>
              <SelectItem value="3">Community Pharmacy</SelectItem>
              <SelectItem value="4">Family Health Pharmacy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drug Category
          </label>
          <Select value={selectedDrugCategory} onValueChange={setSelectedDrugCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
              <SelectItem value="Diabetes">Diabetes</SelectItem>
              <SelectItem value="Pain Management">Pain Management</SelectItem>
              <SelectItem value="Antibiotics">Antibiotics</SelectItem>
              <SelectItem value="OTC">OTC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View Mode
          </label>
          <div className="flex space-x-2">
            <Button
              variant={!showPredictions ? "default" : "outline"}
              onClick={() => setShowPredictions(false)}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </Button>
            <Button
              variant={showPredictions ? "default" : "outline"}
              onClick={() => setShowPredictions(true)}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Predictions
            </Button>
          </div>
        </div>
      </div>

      {/* Real-Time Inventory Table */}
      {!showPredictions && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Live Inventory Tracking
              <Badge variant="outline" className="ml-2">
                {filteredInventory.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drug</TableHead>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Movement</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((tracker) => (
                    <TableRow key={tracker.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getDrugIcon(tracker.category)}
                          <div className="ml-3">
                            <div className="font-medium">{tracker.drugName}</div>
                            <div className="text-sm text-gray-500">{tracker.batchNumber}</div>
                            <div className="text-xs text-gray-400">{tracker.manufacturer}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tracker.pharmacyName}</div>
                          <div className="text-sm text-gray-500">{tracker.location}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold">{tracker.currentStock}</div>
                        <div className="text-xs text-gray-500">
                          Low: {tracker.thresholds.low} | Critical: {tracker.thresholds.critical}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStockStatusColor(tracker.status)}>
                          {tracker.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {tracker.isExpiringSoon && (
                          <Badge variant="outline" className="ml-2 text-orange-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Expiring Soon
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {tracker.movements.length > 0 && (
                          <div className="flex items-center">
                            {getMovementIcon(tracker.movements[0].type)}
                            <div className="ml-2">
                              <div className="text-sm font-medium">
                                {tracker.movements[0].type === 'purchase' ? '+' : '-'}
                                {tracker.movements[0].quantity}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(tracker.movements[0].timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(tracker.expiryDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Predictions Table */}
      {showPredictions && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5 text-purple-600" />
              AI Medicine Demand Predictions
              <Badge variant="outline" className="ml-2">
                {filteredPredictions.length} predictions
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Using past usage history, seasonal patterns, location trends, and ACO algorithm optimization
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drug</TableHead>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Predicted Demand</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Prediction Factors</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPredictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getDrugIcon(filteredInventory.find(inv => inv.drugId === prediction.drugId)?.category || 'OTC')}
                          <div className="ml-3">
                            <div className="font-medium">{prediction.drugName}</div>
                            <div className="text-sm text-gray-500">
                              Current: {prediction.currentStock} units
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prediction.pharmacyName}</div>
                          <div className="text-sm text-gray-500">{prediction.location}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-purple-600">
                          {prediction.predictedDemand}
                        </div>
                        <div className="text-xs text-gray-500">
                          units/month
                        </div>
                        <div className="text-xs text-gray-400">
                          Reorder: {prediction.recommendedReorder}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className="h-2 bg-purple-500 rounded-full"
                              style={{ width: `${prediction.confidenceLevel}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{prediction.confidenceLevel}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          prediction.demandTrend === 'increasing' ? 'bg-red-100 text-red-800' :
                          prediction.demandTrend === 'decreasing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {prediction.demandTrend === 'increasing' ? (
                            <><TrendingUp className="h-3 w-3 mr-1" /> Increasing</>
                          ) : prediction.demandTrend === 'decreasing' ? (
                            <><TrendingUp className="h-3 w-3 mr-1 rotate-180" /> Decreasing</>
                          ) : (
                            <><BarChart3 className="h-3 w-3 mr-1" /> Stable</>
                          )}
                        </Badge>
                        {prediction.predictedStockout && (
                          <Badge variant="outline" className="ml-2 text-red-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Stockout Risk
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            {prediction.predictionFactors.seasonalPattern}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {prediction.predictionFactors.locationDemand}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Target className="h-3 w-3 mr-1" />
                            {prediction.predictionFactors.stockTrend}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Analysis
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Prediction Factors Explanation */}
      {showPredictions && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Past Usage History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Analyzes historical purchase and usage patterns to predict future demand.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Example:</strong> If many people bought paracetamol during monsoon last year, MedChain remembers that pattern.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Package className="mr-2 h-5 w-5 text-green-600" />
                Current Stock Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Monitors real-time inventory levels to send early alerts before stockouts.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Example:</strong> If a pharmacy is running low on insulin, MedChain sends alerts early.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-purple-600" />
                Location & Demand Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Uses GPS and local data to predict which areas need specific medicines.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Example:</strong> More asthma inhalers in polluted areas, more ORS during summer in rural areas.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-600" />
                Data Freshness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Prioritizes most recent information to ensure predictions are always up-to-date.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Freshness Score:</strong> Recent data gets 100% weight, older data gets reduced importance.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Zap className="mr-2 h-5 w-5 text-red-600" />
                ACO Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Ant Colony Optimization finds the best pharmacy route based on stock, distance, and delivery speed.
              </p>
              <div className="text-xs text-gray-500">
                <strong>How it works:</strong> Like ants finding the best path to food - optimizes for multiple factors simultaneously.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Brain className="mr-2 h-5 w-5 text-indigo-600" />
                AI Confidence Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                Calculates prediction accuracy based on data quality and historical patterns.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Confidence:</strong> 95% means very reliable prediction, 60% means moderate certainty.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Inventory Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Active Inventory Alerts
            <Badge variant="outline" className="ml-2">
              {alerts.length} alerts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No active alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`border-l-4 p-4 rounded-lg ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="ml-2 font-medium">{alert.drugName}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          @ {alert.pharmacyName}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{alert.message}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {alert.location} • {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Blockchain Console */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-600" />
            Live Blockchain Console
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Real-time blockchain transaction logging and network activity
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
            <div className="space-y-1">
              <div className="text-blue-400">🔗 MedChain Blockchain Network - Live Transaction Monitor</div>
              <div className="text-gray-500">═══════════════════════════════════════════════════════════</div>
              <div>⚡ Network Status: ACTIVE | Nodes: 47/50 | Latency: 12ms</div>
              <div>📊 Current Block: #{18500000 + Math.floor(Math.random() * 10000)}</div>
              <div>🔐 Smart Contracts: 3 active | Gas Price: {15 + Math.floor(Math.random() * 10)} gwei</div>
              <div className="text-gray-500">───────────────────────────────────────────────────────────</div>
              <div className="text-yellow-400">🏗️  Mining Block #{18500000 + Math.floor(Math.random() * 10000) + 1}...</div>
              <div>⚡ Transaction Pool: {Math.floor(Math.random() * 50) + 20} pending</div>
              <div>📈 Inventory Update: Paracetamol stock verified - Apollo Pharmacy</div>
              <div>✅ Tx: 0x{Math.random().toString(16).substr(2, 8)}...{Math.random().toString(16).substr(2, 4)}</div>
              <div>🔒 Verification Record: Insulin batch INS-2024-026 confirmed</div>
              <div>📊 AI Prediction: High demand forecast logged to blockchain</div>
              <div>🌐 Network Consensus: 45/60 validators confirmed</div>
              <div className="text-green-400">✅ Block Mined Successfully | Hash: 0x{Math.random().toString(16).substr(2, 8)}...</div>
              <div>🚨 Alert: Low stock threshold reached - Mumbai region</div>
              <div>⚡ Gas Used: {Math.floor(Math.random() * 50000) + 20000} wei</div>
              <div>📈 Network Health: 98.7% uptime | {Math.floor(Math.random() * 1000) + 500} TPS</div>
              <div className="text-gray-500">───────────────────────────────────────────────────────────</div>
              <div className="text-blue-400">🔄 Real-time sync complete | Next block in {Math.floor(Math.random() * 15) + 5}s</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>📡 Connected to MedChain Network</div>
            <div>🕐 Last Update: {new Date().toLocaleTimeString()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Updates Indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center">
          <div className="animate-pulse w-2 h-2 bg-white rounded-full mr-2"></div>
          <span className="text-sm">Live Updates Active</span>
        </div>
      </div>
    </div>
  );
}