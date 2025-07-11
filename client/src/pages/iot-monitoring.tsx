import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Thermometer, 
  Droplets, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface IoTSensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'motion' | 'light' | 'pressure';
  pharmacyId: number;
  pharmacyName: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastReading: {
    value: number;
    unit: string;
    timestamp: string;
  };
  thresholds: {
    min: number;
    max: number;
    optimal: { min: number; max: number };
  };
  batteryLevel: number;
  readings: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface IoTAlert {
  id: string;
  sensorId: string;
  sensorName: string;
  type: 'temperature' | 'humidity' | 'offline' | 'battery';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  pharmacyName: string;
  location: string;
}

export default function IoTMonitoring() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("all");
  const [selectedSensorType, setSelectedSensorType] = useState<string>("all");
  const [realTimeData, setRealTimeData] = useState<IoTSensor[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => prev.map(sensor => ({
        ...sensor,
        lastReading: {
          ...sensor.lastReading,
          value: generateRealisticReading(sensor.type, sensor.lastReading.value),
          timestamp: new Date().toISOString()
        },
        readings: [
          ...sensor.readings.slice(-23), // Keep last 24 readings
          {
            timestamp: new Date().toISOString(),
            value: generateRealisticReading(sensor.type, sensor.lastReading.value)
          }
        ]
      })));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const generateRealisticReading = (type: string, currentValue: number) => {
    const variation = Math.random() * 2 - 1; // -1 to 1
    switch (type) {
      case 'temperature':
        return Math.max(15, Math.min(35, currentValue + variation));
      case 'humidity':
        return Math.max(30, Math.min(80, currentValue + variation * 2));
      case 'pressure':
        return Math.max(1000, Math.min(1020, currentValue + variation * 0.5));
      default:
        return currentValue + variation;
    }
  };

  const mockSensors: IoTSensor[] = [
    {
      id: 'temp_001',
      name: 'Cold Storage Monitor',
      type: 'temperature',
      pharmacyId: 1,
      pharmacyName: 'Central Pharmacy',
      location: 'Cold Storage Room',
      status: 'online',
      lastReading: {
        value: 4.5,
        unit: '°C',
        timestamp: new Date().toISOString()
      },
      thresholds: {
        min: 2,
        max: 8,
        optimal: { min: 2, max: 8 }
      },
      batteryLevel: 85,
      readings: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        value: 4 + Math.random() * 2
      }))
    },
    {
      id: 'hum_001',
      name: 'Humidity Sensor',
      type: 'humidity',
      pharmacyId: 1,
      pharmacyName: 'Central Pharmacy',
      location: 'Main Storage',
      status: 'online',
      lastReading: {
        value: 55,
        unit: '%',
        timestamp: new Date().toISOString()
      },
      thresholds: {
        min: 40,
        max: 70,
        optimal: { min: 45, max: 65 }
      },
      batteryLevel: 92,
      readings: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        value: 50 + Math.random() * 20
      }))
    },
    {
      id: 'temp_002',
      name: 'Ambient Temperature',
      type: 'temperature',
      pharmacyId: 2,
      pharmacyName: 'Downtown Pharmacy',
      location: 'Retail Area',
      status: 'warning',
      lastReading: {
        value: 28.2,
        unit: '°C',
        timestamp: new Date().toISOString()
      },
      thresholds: {
        min: 15,
        max: 25,
        optimal: { min: 18, max: 22 }
      },
      batteryLevel: 15,
      readings: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        value: 24 + Math.random() * 6
      }))
    }
  ];

  const mockAlerts: IoTAlert[] = [
    {
      id: 'alert_001',
      sensorId: 'temp_002',
      sensorName: 'Ambient Temperature',
      type: 'temperature',
      severity: 'high',
      message: 'Temperature above optimal range (28.2°C)',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      acknowledged: false,
      pharmacyName: 'Downtown Pharmacy',
      location: 'Retail Area'
    },
    {
      id: 'alert_002',
      sensorId: 'temp_002',
      sensorName: 'Ambient Temperature',
      type: 'battery',
      severity: 'medium',
      message: 'Low battery level (15%)',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      acknowledged: false,
      pharmacyName: 'Downtown Pharmacy',
      location: 'Retail Area'
    }
  ];

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-5 w-5" />;
      case 'humidity': return <Droplets className="h-5 w-5" />;
      case 'pressure': return <Activity className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
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

  const isValueInRange = (value: number, thresholds: any) => {
    return value >= thresholds.min && value <= thresholds.max;
  };

  const filteredSensors = mockSensors.filter(sensor => {
    const matchesPharmacy = selectedPharmacy === 'all' || sensor.pharmacyId.toString() === selectedPharmacy;
    const matchesType = selectedSensorType === 'all' || sensor.type === selectedSensorType;
    return matchesPharmacy && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          IoT Environmental Monitoring
        </h1>
        <p className="text-gray-600">
          Real-time monitoring of temperature, humidity, and storage conditions across pharmacies
        </p>
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
              <SelectItem value="3">West Side Pharmacy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sensor Type
          </label>
          <Select value={selectedSensorType} onValueChange={setSelectedSensorType}>
            <SelectTrigger>
              <SelectValue placeholder="Select sensor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sensors</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="humidity">Humidity</SelectItem>
              <SelectItem value="pressure">Pressure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Alerts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Active Alerts ({mockAlerts.filter(a => !a.acknowledged).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAlerts.filter(alert => !alert.acknowledged).map(alert => (
              <div key={alert.id} className="p-4 border rounded-lg bg-red-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {alert.pharmacyName} - {alert.location}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sensor Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredSensors.map(sensor => (
          <Card key={sensor.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSensorIcon(sensor.type)}
                  <span className="font-medium">{sensor.name}</span>
                </div>
                <Badge className={getStatusColor(sensor.status)}>
                  {sensor.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                <MapPin className="inline h-3 w-3 mr-1" />
                {sensor.pharmacyName} - {sensor.location}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Reading */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {sensor.lastReading.value.toFixed(1)}
                    <span className="text-lg text-gray-600 ml-1">
                      {sensor.lastReading.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {isValueInRange(sensor.lastReading.value, sensor.thresholds) ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      Optimal: {sensor.thresholds.optimal.min}-{sensor.thresholds.optimal.max}{sensor.lastReading.unit}
                    </span>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-12 flex items-end justify-between gap-1">
                  {sensor.readings.slice(-12).map((reading, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-200 rounded-t"
                      style={{
                        height: `${Math.max(10, (reading.value / sensor.thresholds.max) * 100)}%`,
                        width: '6px'
                      }}
                    />
                  ))}
                </div>

                {/* Battery Level */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Battery</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          sensor.batteryLevel > 30 ? 'bg-green-500' : 
                          sensor.batteryLevel > 15 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${sensor.batteryLevel}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{sensor.batteryLevel}%</span>
                  </div>
                </div>

                {/* Last Update */}
                <div className="text-xs text-gray-500 text-center">
                  Updated: {new Date(sensor.lastReading.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sensor Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sensor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Thresholds</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Last Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSensors.map(sensor => (
                  <TableRow key={sensor.id}>
                    <TableCell className="font-medium">{sensor.name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sensor.pharmacyName}</div>
                        <div className="text-sm text-gray-600">{sensor.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSensorIcon(sensor.type)}
                        <span className="capitalize">{sensor.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {sensor.lastReading.value.toFixed(1)}{sensor.lastReading.unit}
                        </span>
                        {isValueInRange(sensor.lastReading.value, sensor.thresholds) ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sensor.status)}>
                        {sensor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {sensor.thresholds.min}-{sensor.thresholds.max}{sensor.lastReading.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              sensor.batteryLevel > 30 ? 'bg-green-500' : 
                              sensor.batteryLevel > 15 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${sensor.batteryLevel}%` }}
                          />
                        </div>
                        <span className="text-sm">{sensor.batteryLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(sensor.lastReading.timestamp).toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}