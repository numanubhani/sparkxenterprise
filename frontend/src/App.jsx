import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import LiveChat from './components/layout/LiveChat.jsx';
import { initTracking } from './lib/tracking.js';
import Layout from './components/layout/Layout.jsx';
import { GuestOnly, RequireAdmin, RequireAuth } from './components/auth/Guards.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Quote from './pages/Quote.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import ContentPage from './pages/ContentPage.jsx';
import NotFound from './pages/NotFound.jsx';
import { ForgotPassword, Login, Register, ResetPassword, VerifyEmail } from './pages/auth/AuthPages.jsx';
import AccountLayout from './pages/account/AccountLayout.jsx';
import {
  AccountDashboard, AccountSettings, CompanyProfile, KybCompliance, MyQuotes, MyRequests, RequestDetail, SavedProducts,
} from './pages/account/AccountPages.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import { AdminProductForm, AdminProducts } from './pages/admin/AdminProducts.jsx';
import AdminChats from './pages/admin/AdminChats.jsx';
import { AdminOverview, AdminRequestDetail, AdminRequests, AdminUserDetail, AdminUsers } from './pages/admin/AdminPages.jsx';

export default function App() {
  useEffect(() => {
    initTracking();
  }, []);

  return (
    <>
    <LiveChat />
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="quote" element={<Quote />} />

        <Route path="company/about" element={<About />} />
        <Route path="company/contact" element={<Contact />} />
        <Route path="resources/how-it-works" element={<HowItWorks />} />

        {/* Template-driven pages: content lives in src/data/pages.js */}
        <Route path="solutions/:slug" element={<ContentPage />} />
        <Route path="company/:slug" element={<ContentPage />} />
        <Route path="resources/:slug" element={<ContentPage />} />

        {/* Auth */}
        <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />

        {/* Customer account */}
        <Route element={<RequireAuth />}>
          <Route path="account" element={<AccountLayout />}>
            <Route index element={<AccountDashboard />} />
            <Route path="requests" element={<MyRequests />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="quotes" element={<MyQuotes />} />
            <Route path="saved" element={<SavedProducts />} />
            <Route path="company" element={<CompanyProfile />} />
            <Route path="kyb" element={<KybCompliance />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin dashboard (own layout, no marketing header/footer) */}
      <Route element={<RequireAdmin />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="requests/:id" element={<AdminRequestDetail />} />
          <Route path="chats" element={<AdminChats />} />
          <Route path="chats/:id" element={<AdminChats />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:slug" element={<AdminProductForm />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
        </Route>
      </Route>
    </Routes>
    </>
  );
}
