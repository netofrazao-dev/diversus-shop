import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * CollapsibleSection — seção que abre/fecha, usada pra deixar o formulário
 * de produto mais enxuto: as partes opcionais (promoção, variações, combos...)
 * ficam fechadas por padrão, então cadastrar um produto simples é rápido.
 *
 * props:
 *  - title: título da seção
 *  - icon: componente de ícone (lucide)
 *  - badge: texto curto opcional mostrado ao lado do título (ex: "2 grupos")
 *  - defaultOpen: se começa aberta
 *  - className: classes extras do container (pra cor de fundo)
 */
export default function CollapsibleSection({
  title,
  icon: Icon,
  badge,
  defaultOpen = false,
  className = '',
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border-2 border-black rounded-2xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        {Icon && <Icon size={18} className="shrink-0" />}
        <span className="font-display font-bold flex-1">{title}</span>
        {badge && (
          <span className="text-xs font-display font-bold bg-white border-2 border-black rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0">
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
