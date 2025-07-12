import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useState } from "react";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Verify Drug", href: "/verify-drug" },
    { name: "Emergency Stock", href: "/emergency-locator" },
    { name: "Portal", href: "/portal" },
  ];

  const advancedFeatures = [
    { name: "Blockchain Tracker", href: "/blockchain-tracker" },
    { name: "Inventory Tracking", href: "/iot-monitoring" },
    { name: "AI Forecasting", href: "/ai-forecasting" },
    { name: "IVR System", href: "/ivr-system" },
    { name: "Incentives", href: "/incentive-system" },
    { name: "Support", href: "/support" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900">MedChain</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:ml-10 lg:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-2 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Advanced Features Dropdown */}
              <div className="relative group">
                <button className="px-2 py-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                  Advanced ↓
                </button>
                <div className="absolute top-full left-0 w-48 bg-white shadow-lg border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {advancedFeatures.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                        isActive(item.href) ? "text-primary bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name}
                </span>
                {user?.role === "admin" && (
                  <Link href="/admin-dashboard">
                    <Button variant="outline" size="sm">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                {user?.role === "pharmacy" && (
                  <Link href="/pharmacy-dashboard">
                    <Button variant="outline" size="sm">
                      Pharmacy Panel
                    </Button>
                  </Link>
                )}
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button className="bg-primary hover:bg-blue-700">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-secondary hover:bg-green-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary bg-blue-50"
                    : "text-gray-500 hover:text-primary hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Welcome, {user?.name}
                  </div>
                  {user?.role === "admin" && (
                    <Link href="/admin-dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  {user?.role === "pharmacy" && (
                    <Link href="/pharmacy-dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Pharmacy Panel
                      </Button>
                    </Link>
                  )}
                  <Button onClick={logout} variant="outline" size="sm" className="w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-blue-700">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-secondary hover:bg-green-700">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
