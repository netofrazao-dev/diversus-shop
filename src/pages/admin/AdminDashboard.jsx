import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, LogOut, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Pedidos', to: '/admin', icon: LayoutGrid, end: true },
  { label: 'Produtos', to: '/admin/produtos', icon: Package },
];

export default function AdminDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-primary-50/40">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-4 border-black flex flex-col p-5 gap-6 hidden md:flex">
        <div className="flex items-center gap-2">
          <div className="bg-primary border-3 border-black rounded-xl w-9 h-9 flex items-center justify-center shadow-cartoon-sm">
            <span className="font-display font-bold text-white">D</span>
          </div>
          <span className="font-display font-bold text-lg">Admin</span>
        </div>

        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-2.5 font-display font-semibold text-sm
                px-4 py-3 rounded-xl border-2 border-black transition-colors
                ${isActive ? 'bg-primary text-white shadow-cartoon-sm' : 'bg-white text-black hover:bg-secondary/30'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <a
            href="/"
            className="flex items-center gap-2.5 font-display font-semibold text-sm px-4 py-3 rounded-xl border-2 border-black bg-white hover:bg-accent-yellow/50"
          >
            <Store size={18} /> Ver loja
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 font-display font-semibold text-sm px-4 py-3 rounded-xl border-2 border-black bg-white text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} /> Sair
          </button>
          {user?.email && (
            <p className="text-xs text-black/40 px-2 truncate">{user.email}</p>
          )}
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-5 sm:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
