import { HashRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import ScrollToTop from './components/layout/ScrollToTop';
import AppRoutes from './routes/AppRoutes';
import { useCouponCapture } from './hooks/useCouponCapture';

const queryClient = new QueryClient();

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  useCouponCapture();

  return (
    <div className="min-h-screen flex flex-col bg-white font-body">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CartDrawer />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ScrollToTop />
        <Layout />
      </HashRouter>
    </QueryClientProvider>
  );
}
