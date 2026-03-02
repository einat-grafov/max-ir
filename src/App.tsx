import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Team from "./pages/Team";
import Store from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Orders from "./pages/admin/Orders";
import CreateOrder from "./pages/admin/CreateOrder";
import Products from "./pages/admin/Products";
import CreateProduct from "./pages/admin/CreateProduct";
import EditProduct from "./pages/admin/EditProduct";
import Customers from "./pages/admin/Customers";
import Analytics from "./pages/admin/Analytics";
import Inquiries from "./pages/admin/Inquiries";
import UsersSettings from "./pages/admin/settings/UsersSettings";
import BillingSettings from "./pages/admin/settings/BillingSettings";
import ShippingSettings from "./pages/admin/settings/ShippingSettings";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";

const queryClient = new QueryClient();

const RootLayout = () => (
  <CartProvider>
    <Outlet />
  </CartProvider>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/team", element: <Team /> },
      { path: "/store", element: <Store /> },
      { path: "/store/:id", element: <ProductDetail /> },
      { path: "/cart", element: <Cart /> },
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
          { path: "products/create", element: <CreateProduct /> },
          { path: "products/:id", element: <EditProduct /> },
          { path: "customers", element: <Customers /> },
          { path: "inquiries", element: <Inquiries /> },
          { path: "analytics", element: <Analytics /> },
          { path: "settings/users", element: <UsersSettings /> },
          { path: "settings/billing", element: <BillingSettings /> },
          { path: "settings/shipping", element: <ShippingSettings /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
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
