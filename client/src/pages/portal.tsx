import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Search, MapPin, Clock, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function Portal() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Patient/Doctor Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Please log in to access your dashboard and verification tools.
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <Button className="bg-primary hover:bg-blue-700">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-600">
          Your personal healthcare verification dashboard
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/verify-drug">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Verify Medicine
                  </h3>
                  <p className="text-gray-600">
                    Check medicine authenticity using Bar code or batch number
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/emergency-locator">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mr-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Emergency Locator
                  </h3>
                  <p className="text-gray-600">
                    Find medicines in nearby pharmacies
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* User Profile */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Name</p>
              <p className="text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Role</p>
              <p className="text-gray-900 capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Member Since</p>
              <p className="text-gray-900">January 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recent Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Paracetamol 500mg</p>
                <p className="text-sm text-gray-600">Batch: MED-2024-001</p>
              </div>
              <div className="text-right">
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Genuine
                </span>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Aspirin 100mg</p>
                <p className="text-sm text-gray-600">Batch: ASP-2024-045</p>
              </div>
              <div className="text-right">
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Genuine
                </span>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
            
            <div className="text-center py-4">
              <p className="text-gray-600">
                No more recent verifications. Start verifying drugs to see your history here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
