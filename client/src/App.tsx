import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import VerifyDrug from "@/pages/verify-drug";
import EmergencyLocator from "@/pages/emergency-locator";
import Portal from "@/pages/portal";
import PharmacyLogin from "@/pages/pharmacy-login";
import PharmacyDashboard from "@/pages/pharmacy-dashboard";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AddDrug from "@/pages/add-drug";
import DrugDetails from "@/pages/drug-details";
import Support from "@/pages/support";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Assistant from "@/pages/assistant";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/verify-drug" component={VerifyDrug} />
      <Route path="/emergency-locator" component={EmergencyLocator} />
      <Route path="/portal" component={Portal} />
      <Route path="/pharmacy-login" component={PharmacyLogin} />
      <Route path="/pharmacy-dashboard" component={PharmacyDashboard} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/admin/add-drug" component={AddDrug} />
      <Route path="/drug/:batchNumber" component={DrugDetails} />
      <Route path="/support" component={Support} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/assistant" component={Assistant} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
