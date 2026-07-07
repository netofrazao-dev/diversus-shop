import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import Badge from '../ui/Badge';

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Relógios', to: '/catalogo?categoria=relogios' },
  { label: 'Camisas', to: '/catalogo?categoria=camisas' },
  { label: 'Cordões', to: '/catalogo?categoria=cordoes' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const openDrawer = useCartStore((state) => state.openDrawer);

  return (
    <header className="sticky top-0 z-30 bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: -8 }}
              className="bg-primary border-3 border-black rounded-2xl w-11 h-11 flex items-center justify-center shadow-cartoon"
            >
              <span className="font-display font-bold text-white text-xl">D</span>
            </motion.div>
            <span className="font-display font-bold text-2xl text-black hidden sm:block">
              DIVERSUS<span className="text-primary"> SHOP</span>
            </span>
          </Link>

          {/* Links desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) => `
                  font-display font-semibold text-sm px-4 py-2 rounded-xl
                  transition-colors duration-150
                  ${isActive ? 'bg-primary text-white' : 'text-black hover:bg-secondary/40'}
                `}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Ações */}
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ y: 2 }}
              onClick={openDrawer}
              className="relative bg-white border-3 border-black rounded-2xl p-2.5 shadow-cartoon active:translate-y-1 active:shadow-none transition-all"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart size={22} strokeWidth={2.5} />
              {totalItems > 0 && (
                <span className="absolute -top-2.5 -right-2.5">
                  <Badge color="pink" animate>
                    {totalItems}
                  </Badge>
                </span>
              )}
            </motion.button>

            {/* Toggle mobile */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden bg-white border-3 border-black rounded-2xl p-2.5 shadow-cartoon-sm"
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t-3 border-black bg-white"
          >
            <div className="flex flex-col p-4 gap-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    font-display font-semibold px-4 py-3 rounded-xl border-2 border-black
                    ${isActive ? 'bg-primary text-white' : 'bg-white text-black'}
                  `}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
