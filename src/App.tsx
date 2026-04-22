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
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
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
import IntegrationsSettings from "./pages/admin/settings/IntegrationsSettings";
import EmailSettings from "./pages/admin/settings/EmailSettings";
import EmailTemplateEditor from "./pages/admin/settings/EmailTemplateEditor";
import CareerApplications from "./pages/admin/CareerApplications";
import CareerApplicationDetail from "./pages/admin/CareerApplicationDetail";
import Inquiries from "./pages/admin/Inquiries";
import NotFound from "./pages/NotFound";
import DesignSystem from "./pages/DesignSystem";
import Unsubscribe from "./pages/Unsubscribe";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundAndReturn from "./pages/RefundAndReturn";
import ShippingPolicy from "./pages/ShippingPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import AccessibilitySettings from "./pages/admin/optimization/Accessibility";
import Seo from "./pages/admin/optimization/Seo";
import AiSearch from "./pages/admin/optimization/AiSearch";
import Redirects from "./pages/admin/optimization/Redirects";
import Brand from "./pages/admin/Brand";
import AccessibilityWidget from "./components/AccessibilityWidget";
import CookieConsentProvider from "@/components/cookies/CookieConsentProvider";

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
    <AccessibilityWidget />
    <CookieConsentProvider />
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
      { path: "/checkout/success", element: <CheckoutSuccess /> },
      { path: "/checkout/cancel", element: <CheckoutCancel /> },
      { path: "/design-system", element: <DesignSystem /> },
      { path: "/unsubscribe", element: <Unsubscribe /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/refund-and-return", element: <RefundAndReturn /> },
      { path: "/shipping-policy", element: <ShippingPolicy /> },
      { path: "/terms-and-conditions", element: <TermsAndConditions /> },
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
          { path: "brand", element: <Brand /> },
          { path: "inquiries", element: <Inquiries /> },
          { path: "careers", element: <CareerApplications /> },
          { path: "careers/:id", element: <CareerApplicationDetail /> },
          { path: "settings/users", element: <UsersSettings /> },
          { path: "settings/billing", element: <BillingSettings /> },
          { path: "settings/integrations", element: <IntegrationsSettings /> },
          { path: "settings/shipping", element: <Navigate to="/admin/settings/integrations" replace /> },
          { path: "settings/emails", element: <EmailSettings /> },
          { path: "settings/emails/:templateKey", element: <EmailTemplateEditor /> },
          { path: "optimization/seo", element: <Seo /> },
          { path: "optimization/ai-search", element: <AiSearch /> },
          { path: "optimization/redirects", element: <Redirects /> },
          { path: "optimization/accessibility", element: <AccessibilitySettings /> },
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
