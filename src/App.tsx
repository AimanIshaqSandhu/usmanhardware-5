import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FontProvider } from "@/components/FontProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { tokenManager } from "@/services/authApi";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Finances from "./pages/Finances";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Suppliers from "./pages/Suppliers";
import PurchaseOrders from "./pages/PurchaseOrders";
import Quotations from "./pages/Quotations";
import CustomerInsights from "./pages/CustomerInsights";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import BackupSync from "./pages/BackupSync";
import Accounts from "./pages/Accounts";
import Profile from "./pages/Profile";
import Employees from "./pages/Employees";
import OutsourcedOrders from "./pages/OutsourcedOrders";
import Profit from "./pages/Profit";
import Credits from "./pages/Credits";
import Login from "./pages/Login";

const queryClient = new QueryClient();

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

// Public route that redirects to dashboard if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = tokenManager.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="hardware-store-theme">
      <FontProvider defaultFont="inter" storageKey="hardware-store-font">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/profit" element={<Profit />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/outsourced-orders" element={<OutsourcedOrders />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/credits" element={<Credits />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/purchase-orders" element={<PurchaseOrders />} />
                        <Route path="/quotations" element={<Quotations />} />
                        <Route path="/customer-insights" element={<CustomerInsights />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/backup" element={<BackupSync />} />
                        <Route path="/finances" element={<Finances />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FontProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
