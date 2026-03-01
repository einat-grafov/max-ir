import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Team from "./pages/Team";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Orders from "./pages/admin/Orders";
import CreateOrder from "./pages/admin/CreateOrder";
import Products from "./pages/admin/Products";
import Customers from "./pages/admin/Customers";
import Analytics from "./pages/admin/Analytics";
import UsersSettings from "./pages/admin/settings/UsersSettings";
import BillingSettings from "./pages/admin/settings/BillingSettings";
import ShippingSettings from "./pages/admin/settings/ShippingSettings";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <Index /> },
  { path: "/team", element: <Team /> },
  { path: "/design-system", element: <DesignSystem /> },
  { path: "/admin/login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/orders" replace /> },
      { path: "orders", element: <Orders /> },
      { path: "orders/create", element: <CreateOrder /> },
      { path: "products", element: <Products /> },
      { path: "customers", element: <Customers /> },
      { path: "analytics", element: <Analytics /> },
      { path: "settings/users", element: <UsersSettings /> },
      { path: "settings/billing", element: <BillingSettings /> },
      { path: "settings/shipping", element: <ShippingSettings /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
