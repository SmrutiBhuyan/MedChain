import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Calendar,
  MapPin,
  Package
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ForecastData {
  drugId: number;
  drugName: string;
  currentStock: number;
  predictedDemand: number;
  recommendedOrder: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
  timeframe: '1week' | '1month' | '3months';
  riskLevel: 'low' | 'medium' | 'high';
  seasonality: {
    peak: string;
    low: string;
    factor: number;
  };
}

interface DemandPattern {
  period: string;
  demand: number;
  actual?: number;
  predicted: number;
  accuracy: number;
}

interface AIInsight {
  id: string;
  type: 'shortage_warning' | 'surplus_alert' | 'seasonal_trend' | 'demand_spike';
  message: string;
  drugName: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionRequired: boolean;
  timestamp: string;
}

export default function AIForecasting() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1month");
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const mockForecastData: ForecastData[] = [
    {
      drugId: 1,
      drugName: "Aspirin",
      currentStock: 250,
      predictedDemand: 320,
      recommendedOrder: 150,
      confidence: 92,
      trend: 'increasing',
      factors: ['Flu season approaching', 'Historical demand pattern', 'Population increase'],
      timeframe: '1month',
      riskLevel: 'medium',
      seasonality: {
        peak: 'Winter',
        low: 'Summer',
        factor: 1.3
      }
    },
    {
      drugId: 2,
      drugName: "Ibuprofen",
      currentStock: 180,
      predictedDemand: 140,
      recommendedOrder: 0,
      confidence: 87,
      trend: 'stable',
      factors: ['Consistent demand', 'No seasonal variation', 'Adequate stock'],
      timeframe: '1month',
      riskLevel: 'low',
      seasonality: {
        peak: 'Year-round',
        low: 'None',
        factor: 1.0
      }
    },
    {
      drugId: 3,
      drugName: "Paracetamol",
      currentStock: 95,
      predictedDemand: 280,
      recommendedOrder: 250,
      confidence: 95,
      trend: 'increasing',
      factors: ['Viral outbreak trend', 'School season starting', 'Low current stock'],
      timeframe: '1month',
      riskLevel: 'high',
      seasonality: {
        peak: 'Winter/Spring',
        low: 'Summer',
        factor: 1.5
      }
    }
  ];

  const mockDemandPatterns: DemandPattern[] = [
    { period: 'Week 1', demand: 45, actual: 42, predicted: 45, accuracy: 93 },
    { period: 'Week 2', demand: 52, actual: 48, predicted: 52, accuracy: 92 },
    { period: 'Week 3', demand: 38, actual: 35, predicted: 38, accuracy: 92 },
    { period: 'Week 4', demand: 61, predicted: 61, accuracy: 0 },
    { period: 'Week 5', demand: 58, predicted: 58, accuracy: 0 },
    { period: 'Week 6', demand: 49, predicted: 49, accuracy: 0 }
  ];

  const mockAIInsights: AIInsight[] = [
    {
      id: '1',
      type: 'shortage_warning',
      message: 'Paracetamol stock will run out in 8 days based on current consumption pattern',
      drugName: 'Paracetamol',
      impact: 'high',
      confidence: 95,
      actionRequired: true,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'seasonal_trend',
      message: 'Aspirin demand expected to increase by 30% due to approaching flu season',
      drugName: 'Aspirin',
      impact: 'medium',
      confidence: 87,
      actionRequired: true,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      type: 'demand_spike',
      message: 'Unusual demand spike detected for antibiotics in the region',
      drugName: 'Antibiotics',
      impact: 'high',
      confidence: 91,
      actionRequired: true,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'shortage_warning': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'surplus_alert': return <Package className="h-4 w-4 text-blue-600" />;
      case 'seasonal_trend': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'demand_spike': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      default: return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Smart Demand Predictor
        </h1>
        <p className="text-gray-600">
          Intelligent predictions for medicine demand, smart inventory management, and supply chain optimization
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1week">1 Week</SelectItem>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
            Category
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pain-relief">Pain Relief</SelectItem>
              <SelectItem value="antibiotics">Antibiotics</SelectItem>
              <SelectItem value="vitamins">Vitamins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-purple-600" />
            Smart Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAIInsights.map(insight => (
              <div key={insight.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getInsightIcon(insight.type)}
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Reliability: {insight.confidence}%
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">{insight.message}</p>
                    <p className="text-sm text-gray-600">
                      Drug: {insight.drugName} • {new Date(insight.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {insight.actionRequired && (
                    <Button size="sm" className="bg-primary hover:bg-blue-700">
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demand Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mockForecastData.map(forecast => (
          <Card key={forecast.drugId} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{forecast.drugName}</span>
                </div>
                <Badge className={getRiskColor(forecast.riskLevel)}>
                  {forecast.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current vs Predicted */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {forecast.currentStock}
                    </div>
                    <div className="text-sm text-gray-600">Current Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {forecast.predictedDemand}
                    </div>
                    <div className="text-sm text-gray-600">Predicted Demand</div>
                  </div>
                </div>

                {/* Trend */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(forecast.trend)}
                    <span className="text-sm text-gray-600 capitalize">{forecast.trend}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {forecast.confidence}% reliable
                  </div>
                </div>

                {/* Recommended Order */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Recommended Order</div>
                  <div className="text-xl font-bold text-blue-700">
                    {forecast.recommendedOrder > 0 ? `${forecast.recommendedOrder} units` : 'No order needed'}
                  </div>
                </div>

                {/* Seasonality */}
                <div className="text-sm">
                  <div className="font-medium text-gray-700 mb-1">Seasonality</div>
                  <div className="text-gray-600">
                    Peak: {forecast.seasonality.peak} ({forecast.seasonality.factor}x)
                  </div>
                  <div className="text-gray-600">
                    Low: {forecast.seasonality.low}
                  </div>
                </div>

                {/* Key Factors */}
                <div className="text-sm">
                  <div className="font-medium text-gray-700 mb-1">What's Driving This</div>
                  <ul className="text-gray-600 space-y-1">
                    {forecast.factors.slice(0, 2).map((factor, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demand Pattern Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Demand Trends & Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Chart Legend */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-sm">Future</span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 flex items-end justify-between gap-2">
              {mockDemandPatterns.map((pattern, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex justify-center gap-1 mb-2">
                    {/* Predicted bar */}
                    <div
                      className="bg-blue-500 rounded-t"
                      style={{
                        height: `${(pattern.predicted / 70) * 200}px`,
                        width: '12px'
                      }}
                    />
                    {/* Actual bar */}
                    {pattern.actual && (
                      <div
                        className="bg-green-500 rounded-t"
                        style={{
                          height: `${(pattern.actual / 70) * 200}px`,
                          width: '12px'
                        }}
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    {pattern.period}
                  </div>
                  {pattern.accuracy > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      {pattern.accuracy}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Predictor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">92.5%</div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">847</div>
              <div className="text-sm text-gray-600">Smart Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">23</div>
              <div className="text-sm text-gray-600">Shortages Prevented</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">₹2.3M</div>
              <div className="text-sm text-gray-600">Money Saved</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}