import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Button — Componente base do DIVERSUS SHOP
 *
 * Variantes:
 *  - primary   (roxo, ação principal — ex: "Adicionar ao Carrinho")
 *  - secondary (ciano, ações alternativas)
 *  - outline   (branco com borda preta, ações neutras)
 *  - danger    (vermelho/laranja, ações destrutivas no admin)
 *  - ghost     (sem borda/sombra, links de texto)
 *
 * Tamanhos: sm | md | lg | xl (o "Comprar" deve normalmente usar lg/xl)
 */

const VARIANT_STYLES = {
  primary:
    'bg-primary text-white border-black hover:bg-secondary hover:text-black',
  secondary:
    'bg-secondary text-black border-black hover:bg-primary hover:text-white',
  outline:
    'bg-white text-black border-black hover:bg-accent-yellow',
  danger:
    'bg-accent-pink text-black border-black hover:bg-red-500 hover:text-white',
  ghost:
    'bg-transparent text-black border-transparent shadow-none hover:underline',
};

const SIZE_STYLES = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2.5',
  xl: 'px-10 py-5 text-xl gap-3',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  isFullWidth = false,
  className = '',
  disabled = false,
  ...props
}) {
  const isGhost = variant === 'ghost';

  return (
    <motion.button
      whileTap={!disabled && !isLoading ? { y: 4 } : {}}
      className={`
        relative inline-flex items-center justify-center
        font-display font-semibold rounded-2xl
        border-3 ${!isGhost ? 'shadow-cartoon' : ''}
        transition-colors duration-150
        active:translate-y-1 active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-cartoon
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${isFullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={20} strokeWidth={2.5} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={20} strokeWidth={2.5} />}
        </>
      )}
    </motion.button>
  );
}
