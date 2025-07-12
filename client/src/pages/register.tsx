import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, UserPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/lib/auth";

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });
  const { login: authLogin } = useAuth();
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) => 
      register(data),
    onSuccess: (data) => {
      authLogin(data.token, data.user);
      
      // Redirect based on role
      switch (data.user.role) {
        case "admin":
          setLocation("/admin-dashboard");
          break;
        case "pharmacy":
          setLocation("/pharmacy-dashboard");
          break;
        default:
          setLocation("/portal");
      }
      
      toast({
        title: "Registration Successful",
        description: `Welcome to MedChain, ${data.user.name}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Join MedChain</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account for secure healthcare supply chain access
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Create Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Account Type</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{" "}
                  <Link href="/support" className="text-primary hover:text-blue-700">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/support" className="text-primary hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-green-700"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:text-blue-700">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Types Info */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Account Types:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Patient/Doctor:</strong> Access to drug verification and emergency locator</p>
              <p><strong>Pharmacy:</strong> Manage inventory and stock levels</p>
              <p><strong>Admin:</strong> Full system management capabilities</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
