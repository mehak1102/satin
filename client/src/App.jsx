import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/layout/SiteLayout";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { HomePage } from "./pages/Home/HomePage";
import { NotFoundPage } from "./pages/NotFound/NotFoundPage";
import { CartPage } from "./pages/Cart/CartPage";
import { ProductPage } from "./pages/Product/ProductPage";
import { ShopPage } from "./pages/Shop/ShopPage";
import { AdminNotFound, AdminRoute } from "./pages/Admin/AdminShell";

function page(importer, name) {
  return lazy(() => importer().then((module) => ({ default: module[name] })));
}

const AccountPage = page(() => import("./pages/Account/AccountPage"), "AccountPage");
const ForgotPasswordPage = page(() => import("./pages/Account/PasswordPages"), "ForgotPasswordPage");
const ResetPasswordPage = page(() => import("./pages/Account/PasswordPages"), "ResetPasswordPage");
const AdminCustomer = page(() => import("./pages/Admin/AdminCustomers"), "AdminCustomer");
const AdminCustomers = page(() => import("./pages/Admin/AdminCustomers"), "AdminCustomers");
const AdminHome = page(() => import("./pages/Admin/AdminHome"), "AdminHome");
const AdminMessages = page(() => import("./pages/Admin/AdminMessages"), "AdminMessages");
const AdminNoteEditor = page(() => import("./pages/Admin/AdminNotes"), "AdminNoteEditor");
const AdminNotes = page(() => import("./pages/Admin/AdminNotes"), "AdminNotes");
const AdminOrder = page(() => import("./pages/Admin/AdminOrders"), "AdminOrder");
const AdminOrders = page(() => import("./pages/Admin/AdminOrders"), "AdminOrders");
const AdminProduct = page(() => import("./pages/Admin/AdminProducts"), "AdminProduct");
const AdminProductNew = page(() => import("./pages/Admin/AdminProducts"), "AdminProductNew");
const AdminProducts = page(() => import("./pages/Admin/AdminProducts"), "AdminProducts");
const AdminReviews = page(() => import("./pages/Admin/AdminReviews"), "AdminReviews");
const AdminSettings = page(() => import("./pages/Admin/AdminSettings"), "AdminSettings");
const AboutPage = page(() => import("./pages/About/AboutPage"), "AboutPage");
const BlogPage = page(() => import("./pages/Blog/BlogPage"), "BlogPage");
const BlogsPage = page(() => import("./pages/Blog/BlogsPage"), "BlogsPage");
const CheckoutPage = page(() => import("./pages/Checkout/CheckoutPage"), "CheckoutPage");
const ContactPage = page(() => import("./pages/Contact/ContactPage"), "ContactPage");
const FaqPage = page(() => import("./pages/Faq/FaqPage"), "FaqPage");
const LeaveNotesPage = page(() => import("./pages/Newsletter/LeaveNotesPage"), "LeaveNotesPage");
const OrderPage = page(() => import("./pages/Order/OrderPage"), "OrderPage");
const PolicyPage = page(() => import("./pages/Policy/PolicyPage"), "PolicyPage");
const WishlistPage = page(() => import("./pages/Wishlist/WishlistPage"), "WishlistPage");
const TrackerPage = page(() => import("./pages/Tracker/TrackerPage"), "TrackerPage");
const OtherProductsPage = page(() => import("./pages/Shop/OtherProductsPage"), "OtherProductsPage");
const CondomsPage = page(() => import("./pages/Shop/OtherProductsPage"), "CondomsPage");
const MedicinePage = page(() => import("./pages/Shop/OtherProductsPage"), "MedicinePage");

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="other-products" element={<OtherProductsPage />} />
            <Route path="condoms" element={<CondomsPage />} />
            <Route path="medicine" element={<MedicinePage />} />
            <Route path="product/:slug" element={<ProductPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order/:id" element={<OrderPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="tracker" element={<TrackerPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="blogs/:slug" element={<BlogPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="leave-notes" element={<LeaveNotesPage />} />
            <Route path="shipping" element={<PolicyPage kind="shipping" />} />
            <Route path="returns" element={<PolicyPage kind="returns" />} />
            <Route path="privacy" element={<PolicyPage kind="privacy" />} />
            <Route path="terms" element={<PolicyPage kind="terms" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="admin" element={<AdminRoute />}>
            <Route index element={<AdminHome />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomer />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrder />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductNew />} />
            <Route path="products/:id" element={<AdminProduct />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="notes" element={<AdminNotes />} />
            <Route path="notes/new" element={<AdminNoteEditor />} />
            <Route path="notes/:id" element={<AdminNoteEditor />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
