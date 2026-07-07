import { forwardRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Input — Componente base do DIVERSUS SHOP
 *
 * Suporta: label, mensagem de erro, estado de loading (ex: busca de CEP),
 * ícone à esquerda e indicador de sucesso (ex: CEP encontrado).
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      success,
      isLoading = false,
      icon: Icon,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="font-display font-semibold text-sm text-black ml-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <Icon
              size={20}
              strokeWidth={2.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/60 pointer-events-none"
            />
          )}

          <input
            ref={ref}
            id={inputId}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              w-full rounded-2xl border-3 border-black
              bg-white font-body text-black placeholder:text-black/40
              px-4 py-3 ${Icon ? 'pl-11' : ''} ${isLoading || success ? 'pr-11' : ''}
              shadow-cartoon-sm
              transition-all duration-150
              focus:outline-none focus:shadow-cartoon focus:-translate-y-0.5
              ${error ? 'border-red-500' : ''}
              ${focused && !error ? 'border-primary' : ''}
              ${className}
            `}
            {...props}
          />

          {isLoading && (
            <Loader2
              size={20}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-primary"
            />
          )}
          {!isLoading && success && (
            <CheckCircle2
              size={20}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-600"
            />
          )}
        </div>

        {error && (
          <span className="flex items-center gap-1 text-sm font-semibold text-red-600 ml-1">
            <AlertCircle size={14} />
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
