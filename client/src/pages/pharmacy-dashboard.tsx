import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, AlertTriangle, Calendar, TrendingUp, Edit, Plus, Minus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useLocation } from "wouter";

export default function PharmacyDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!isAuthenticated || user?.role !== "pharmacy") {
    setLocation("/pharmacy-login");
    return null;
  }

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory/pharmacy", 1], // Assuming pharmacy ID 1 for demo
    queryFn: async () => {
      const response = await fetch("/api/inventory/pharmacy/1", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      return response.json();
    },
  });

  const stats = {
    totalItems: inventory?.length || 0,
    lowStock: inventory?.filter((item: any) => item.quantity < 10).length || 0,
    expiringSoon: inventory?.filter((item: any) => {
      if (!item.drug || !item.drug.expiryDate || item.drug.expiryDate === null || item.drug.expiryDate === undefined) return false;
      try {
        const expiryDate = new Date(item.drug.expiryDate);
        if (isNaN(expiryDate.getTime())) return false; // Invalid date
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      } catch (error) {
        return false; // If date parsing fails, exclude this item
      }
    }).length || 0,
    monthlySales: "₹45,230",
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-500" };
    if (quantity < 10) return { label: "Low Stock", color: "bg-yellow-500" };
    return { label: "Good Stock", color: "bg-green-500" };
  };

  const filteredInventory = inventory?.filter((item: any) => {
    if (!item.drug) return false;
    const matchesSearch = item.drug.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.drug.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600 mt-1">Apollo Pharmacy - Andheri West</p>
        </div>
        <Button className="bg-primary hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Stock
        </Button>
      </div>

      {/* Alert Section */}
      {(stats.lowStock > 0 || stats.expiringSoon > 0) && (
        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-800">Stock Alert</p>
                <p className="text-sm text-gray-600">
                  {stats.lowStock} medicines are running low on stock, {stats.expiringSoon} medicines expire within 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Stock Items</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Monthly Sales</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.monthlySales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-4 h-auto text-left">
              <div>
                <Plus className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-medium text-gray-900">Add New Stock</h3>
                <p className="text-sm text-gray-600">Add medicines to inventory</p>
              </div>
            </Button>
            <Button variant="outline" className="p-4 h-auto text-left">
              <div>
                <Edit className="h-5 w-5 text-secondary mb-2" />
                <h3 className="font-medium text-gray-900">Update Stock</h3>
                <p className="text-sm text-gray-600">Modify existing inventory</p>
              </div>
            </Button>
            <Button variant="outline" className="p-4 h-auto text-left">
              <div>
                <TrendingUp className="h-5 w-5 text-red-500 mb-2" />
                <h3 className="font-medium text-gray-900">View Reports</h3>
                <p className="text-sm text-gray-600">Sales and inventory reports</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Current Inventory</CardTitle>
            <div className="flex space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="pain-relief">Pain Relief</SelectItem>
                  <SelectItem value="antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="vitamins">Vitamins</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading inventory...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item: any) => {
                  const stockStatus = getStockStatus(item.quantity);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.drug.name}</TableCell>
                      <TableCell>{item.drug.batchNumber}</TableCell>
                      <TableCell>{item.quantity} units</TableCell>
                      <TableCell>{item.drug.expiryDate}</TableCell>
                      <TableCell>
                        <Badge className={`text-white ${stockStatus.color}`}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-secondary hover:text-green-700">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
