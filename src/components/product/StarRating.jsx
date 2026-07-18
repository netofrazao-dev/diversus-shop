import { Star } from 'lucide-react';

/**
 * StarRating — mostra (ou permite escolher) uma nota de 1 a 5 estrelas.
 *
 * Modo exibição (padrão): mostra a nota, com suporte a meia-estrela visual
 * pra médias tipo 4.3.
 * Modo interativo (interactive=true): vira um seletor clicável, usado no
 * formulário de nova avaliação.
 */
export default function StarRating({
  rating = 0,
  size = 18,
  interactive = false,
  onChange,
  className = '',
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars.map((starValue) => {
        const filled = rating >= starValue;
        const halfFilled = !filled && rating >= starValue - 0.5;

        const StarIcon = (
          <Star
            size={size}
            className={
              filled || halfFilled
                ? 'fill-accent-yellow text-black'
                : 'fill-white text-black/30'
            }
            strokeWidth={1.5}
          />
        );

        if (!interactive) {
          return <span key={starValue}>{StarIcon}</span>;
        }

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue)}
            className="hover:scale-110 transition-transform"
            aria-label={`${starValue} estrela${starValue > 1 ? 's' : ''}`}
          >
            {StarIcon}
          </button>
        );
      })}
    </div>
  );
}
