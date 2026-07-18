import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useProductReviews } from '../../hooks/useProducts';
import StarRating from './StarRating';
import ReviewModal from './ReviewModal';
import Button from '../ui/Button';

export default function ProductReviews({ product }) {
  const { data, isLoading } = useProductReviews(product.id);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const reviews = data?.reviews || [];
  const average = data?.average || 0;
  const count = data?.count || 0;

  const handleSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ['product-reviews', product.id] });
  };

  if (isLoading) return null;

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl flex items-center gap-2">
            <MessageSquare size={22} /> Avaliações
          </h2>
          {count > 0 ? (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={average} size={18} />
              <span className="font-display font-semibold text-sm text-black/70">
                {average.toFixed(1)} · {count} avaliaç{count === 1 ? 'ão' : 'ões'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-black/50 mt-1">Nenhuma avaliação ainda — seja o primeiro!</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setModalOpen(true)}>
          Avaliar produto
        </Button>
      </div>

      {reviews.length > 0 && (
        <div className="grid gap-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-display font-semibold">{review.customer_name}</span>
                <StarRating rating={review.rating} size={15} />
              </div>
              {review.comment && (
                <p className="text-sm text-black/70 mt-2">{review.comment}</p>
              )}
              <p className="text-xs text-black/40 mt-2">
                {new Date(review.created_at).toLocaleDateString('pt-BR')}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <ReviewModal
        product={product}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={handleSubmitted}
      />
    </section>
  );
}
