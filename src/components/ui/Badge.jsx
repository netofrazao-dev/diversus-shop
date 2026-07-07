import { motion, AnimatePresence } from 'framer-motion';

/**
 * Badge — Selo/etiqueta cartoon
 *
 * Usado para: tags "Novo" / "Mais Vendido" nos ProductCards,
 * e o contador animado no ícone do carrinho da Navbar.
 */

const COLOR_STYLES = {
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-black',
  yellow: 'bg-accent-yellow text-black',
  pink: 'bg-accent-pink text-black',
  green: 'bg-accent-green text-black',
  white: 'bg-white text-black',
};

export default function Badge({
  children,
  color = 'primary',
  className = '',
  animate = false,
}) {
  return (
    <AnimatePresence>
      <motion.span
        key={animate ? String(children) : undefined}
        initial={animate ? { scale: 0 } : false}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        className={`
          inline-flex items-center justify-center
          font-display font-bold text-xs
          rounded-full border-2 border-black
          shadow-cartoon-sm
          px-2.5 py-1 leading-none
          ${COLOR_STYLES[color]}
          ${className}
        `}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}
