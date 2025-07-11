import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PillBottle, Hospital, CheckCircle, AlertTriangle, Plus, Edit, Trash2, Search, Clock, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/admin-login");
    return null;
  }

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: drugs, isLoading: drugsLoading } = useQuery({
    queryKey: ["/api/drugs"],
    queryFn: async () => {
      const response = await fetch("/api/drugs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch drugs");
      return response.json();
    },
  });

  const { data: verifications } = useQuery({
    queryKey: ["/api/verifications"],
    queryFn: async () => {
      const response = await fetch("/api/verifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch verifications");
      return response.json();
    },
  });

  const deleteDrugMutation = useMutation({
    mutationFn: async (drugId: number) => {
      const response = await apiRequest("DELETE", `/api/drugs/${drugId}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drugs"] });
      toast({
        title: "Success",
        description: "Drug deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete drug",
        variant: "destructive",
      });
    },
  });

  const handleDeleteDrug = (drugId: number) => {
    if (confirm("Are you sure you want to delete this drug?")) {
      deleteDrugMutation.mutate(drugId);
    }
  };

  const filteredDrugs = drugs?.filter((drug: any) =>
    drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drug.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const recentVerifications = verifications?.slice(0, 5) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/admin/add-drug">
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Drug
            </Button>
          </Link>
          <Button className="bg-secondary hover:bg-green-700">
            <Hospital className="mr-2 h-4 w-4" />
            Add Pharmacy
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <PillBottle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Drugs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.totalDrugs || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Hospital className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Pharmacies</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.activePharmacies || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Verifications Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.verificationsToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Counterfeits Detected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.counterfeitsDetected || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Recent Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVerifications.map((verification: any) => (
                <div key={verification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{verification.drug.name}</p>
                    <p className="text-sm text-gray-600">
                      Batch: {verification.drug.batchNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`text-white ${
                        verification.result === "genuine" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {verification.result === "genuine" ? "Genuine" : "Counterfeit"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(verification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentVerifications.length === 0 && (
                <p className="text-gray-600 text-center py-4">No recent verifications</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-secondary" />
              System Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verification Success Rate</span>
                <span className="font-semibold text-green-600">
                  {stats?.totalDrugs > 0 
                    ? ((stats?.totalDrugs - stats?.counterfeitsDetected) / stats?.totalDrugs * 100).toFixed(1) + '%'
                    : '100%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: stats?.totalDrugs > 0 
                      ? `${((stats?.totalDrugs - stats?.counterfeitsDetected) / stats?.totalDrugs * 100)}%`
                      : '100%'
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pharmacy Response Time</span>
                <span className="font-semibold text-primary">1.2s avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Uptime</span>
                <span className="font-semibold text-green-600">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drug Management Table */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Drug Management</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search drugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {drugsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading drugs...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrugs.map((drug: any) => (
                  <TableRow key={drug.id}>
                    <TableCell className="font-medium">{drug.name}</TableCell>
                    <TableCell>{drug.batchNumber}</TableCell>
                    <TableCell>{drug.manufacturer}</TableCell>
                    <TableCell>{drug.expiryDate}</TableCell>
                    <TableCell>
                      <Badge className={`text-white ${
                        drug.isCounterfeit ? "bg-red-500" : "bg-green-500"
                      }`}>
                        {drug.isCounterfeit ? "Counterfeit" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/drug/${drug.batchNumber}`}>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteDrug(drug.id)}
                          disabled={deleteDrugMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
