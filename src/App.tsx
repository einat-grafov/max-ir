import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { useEffect } from "react";
import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import Team from "./pages/Team";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./components/admin/AdminLayout";
import Orders from "./pages/admin/Orders";
import CreateOrder from "./pages/admin/CreateOrder";
import OrderDetail from "./pages/admin/OrderDetail";
import Products from "./pages/admin/Products";
import CreateProduct from "./pages/admin/CreateProduct";
import EditProduct from "./pages/admin/EditProduct";
import Customers from "./pages/admin/Customers";
import CreateCustomer from "./pages/admin/CreateCustomer";
import EditCustomer from "./pages/admin/EditCustomer";
import Analytics from "./pages/admin/Analytics";
import Website from "./pages/admin/Website";
import UsersSettings from "./pages/admin/settings/UsersSettings";
import BillingSettings from "./pages/admin/settings/BillingSettings";
import ShippingSettings from "./pages/admin/settings/ShippingSettings";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";
import Unsubscribe from "./pages/Unsubscribe";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
};

const RootLayout = () => (
  <CartProvider>
    <ScrollToTop />
    <Outlet />
  </CartProvider>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/about-us", element: <AboutUs /> },
      { path: "/team", element: <Team /> },
      { path: "/store", element: <Navigate to="/#Products" replace /> },
      { path: "/products/:id", element: <ProductDetail /> },
      { path: "/store/:id", element: <ProductDetail /> },
      { path: "/cart", element: <Cart /> },
      { path: "/design-system", element: <DesignSystem /> },
      { path: "/unsubscribe", element: <Unsubscribe /> },
      { path: "/admin/login", element: <AdminLogin /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/home" replace /> },
          { path: "home", element: <Analytics /> },
          { path: "orders", element: <Orders /> },
          { path: "orders/create", element: <CreateOrder /> },
          { path: "orders/:id", element: <OrderDetail /> },
          { path: "products", element: <Products /> },
          { path: "products/create", element: <CreateProduct /> },
          { path: "products/:id", element: <EditProduct /> },
          { path: "customers", element: <Customers /> },
          { path: "customers/create", element: <CreateCustomer /> },
          { path: "customers/:id", element: <EditCustomer /> },
          { path: "website", element: <Website /> },
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
    <TooltipProvider delayDuration={0}>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
