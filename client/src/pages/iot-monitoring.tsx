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
  Plus
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
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'reorder' | 'movement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  pharmacyName: string;
  location: string;
  currentStock: number;
  threshold: number;
}

export default function RealTimeInventoryTracking() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("all");
  const [selectedDrugCategory, setSelectedDrugCategory] = useState<string>("all");
  const [realTimeData, setRealTimeData] = useState<InventoryTracker[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

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

  const generateInventoryAlerts = (trackers: InventoryTracker[]): InventoryAlert[] => {
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

    return alerts;
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
    setAlerts(generateInventoryAlerts(mockInventoryTrackers));
  }, []);

  // Update alerts when inventory changes
  useEffect(() => {
    setAlerts(generateInventoryAlerts(realTimeData));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📦 Real-Time Inventory Tracking
        </h1>
        <p className="text-gray-600">
          Live monitoring of medicine quantities, stock levels, and inventory movements across all pharmacies
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
      </div>

      {/* Real-Time Inventory Table */}
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