import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './ProtectedRoute';

// Storefront — carregado junto (é o que todo visitante usa)
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import ProductDetail from '../pages/ProductDetail';
import Checkout from '../pages/Checkout';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import OrderTracking from '../pages/OrderTracking';
import ReturnsPolicy from '../pages/ReturnsPolicy';

// Admin — só é baixado quando alguém realmente acessa /admin/*, então
// o cliente comum (que nunca entra no admin) não paga esse custo de
// carregamento. Isso é "code splitting": em vez de um arquivo JS gigante
// com tudo junto, o navegador baixa o admin sob demanda.
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminCoupons = lazy(() => import('../pages/admin/AdminCoupons'));
const AdminStories = lazy(() => import('../pages/admin/AdminStories'));
const AdminActivityLog = lazy(() => import('../pages/admin/AdminActivityLog'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));
const AdminRestockRequests = lazy(() => import('../pages/admin/AdminRestockRequests'));
const AdminSuggestions = lazy(() => import('../pages/admin/AdminSuggestions'));

function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Storefront */}
      <Route path="/" element={<Home />} />
      <Route path="/catalogo" element={<Catalog />} />
      <Route path="/produto/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/privacidade" element={<PrivacyPolicy />} />
      <Route path="/meu-pedido" element={<OrderTracking />} />
      <Route path="/trocas-e-devolucoes" element={<ReturnsPolicy />} />

      {/* Admin — cada rota entra num <Suspense> próprio */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminLogin />
          </Suspense>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminOrders />
              </Suspense>
            }
          />
          <Route
            path="produtos"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminProducts />
              </Suspense>
            }
          />
          <Route
            path="categorias"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminCategories />
              </Suspense>
            }
          />
          <Route
            path="cupons"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminCoupons />
              </Suspense>
            }
          />
          <Route
            path="stories"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminStories />
              </Suspense>
            }
          />
          <Route
            path="atividade"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminActivityLog />
              </Suspense>
            }
          />
          <Route
            path="avaliacoes"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminReviews />
              </Suspense>
            }
          />
          <Route
            path="desejos"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminRestockRequests />
              </Suspense>
            }
          />
          <Route
            path="sugestoes"
            element={
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminSuggestions />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
