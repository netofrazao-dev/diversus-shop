import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, RefreshCcw, Trash2, EyeOff, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import StarRating from '../../components/product/StarRating';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (!error) setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const toggleVisible = async (review) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, is_visible: !r.is_visible } : r))
    );
    await supabase.from('product_reviews').update({ is_visible: !review.is_visible }).eq('id', review.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta avaliação?')) return;
    await supabase.from('product_reviews').delete().eq('id', id);
    loadReviews();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
          <MessageSquare size={26} /> Avaliações
        </h1>
        <button
          onClick={loadReviews}
          className="flex items-center gap-2 bg-white border-2 border-black rounded-xl px-4 py-2 font-display font-semibold text-sm shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
        >
          <RefreshCcw size={16} /> Atualizar
        </button>
      </div>

      {loading ? (
        <p className="font-display text-black/50">Carregando...</p>
      ) : reviews.length === 0 ? (
        <p className="font-display text-black/50">Nenhuma avaliação recebida ainda.</p>
      ) : (
        <div className="grid gap-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 ${
                !review.is_visible ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-display font-semibold text-xs text-primary uppercase tracking-wide">
                    {review.products?.name || 'Produto removido'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-display font-semibold">{review.customer_name}</span>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  {review.comment && <p className="text-sm text-black/70 mt-1.5">{review.comment}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleVisible(review)}
                    className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none"
                    title={review.is_visible ? 'Ocultar da loja' : 'Mostrar na loja'}
                  >
                    {review.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm text-red-600 active:translate-y-0.5 active:shadow-none"
                    aria-label="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
