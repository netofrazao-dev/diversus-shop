import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import ProductDetail from '../pages/ProductDetail';
import Checkout from '../pages/Checkout';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminRestockRequests from '../pages/admin/AdminRestockRequests';
import AdminSuggestions from '../pages/admin/AdminSuggestions';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Storefront */}
      <Route path="/" element={<Home />} />
      <Route path="/catalogo" element={<Catalog />} />
      <Route path="/produto/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/privacidade" element={<PrivacyPolicy />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminOrders />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="cupons" element={<AdminCoupons />} />
          <Route path="avaliacoes" element={<AdminReviews />} />
          <Route path="desejos" element={<AdminRestockRequests />} />
          <Route path="sugestoes" element={<AdminSuggestions />} />
        </Route>
      </Route>
    </Routes>
  );
}
