import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import ProductDetail from '../pages/ProductDetail';
import Checkout from '../pages/Checkout';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminProducts from '../pages/admin/AdminProducts';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Storefront */}
      <Route path="/" element={<Home />} />
      <Route path="/catalogo" element={<Catalog />} />
      <Route path="/produto/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminOrders />} />
          <Route path="produtos" element={<AdminProducts />} />
        </Route>
      </Route>
    </Routes>
  );
}
