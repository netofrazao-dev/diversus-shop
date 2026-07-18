import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Input from '../ui/Input';
import Button from '../ui/Button';
import HoneypotField from '../ui/HoneypotField';
import StarRating from './StarRating';

/**
 * ReviewModal — formulário de nova avaliação (estrelas + comentário opcional)
 */
export default function ReviewModal({ product, isOpen, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // preenchido = bot, aborta silenciosamente
    if (rating === 0) {
      setError('Escolha de 1 a 5 estrelas.');
      return;
    }
    if (!name.trim()) {
      setError('Informe seu nome.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { error: err } = await supabase.from('product_reviews').insert({
        product_id: product.id,
        customer_name: name.trim(),
        rating,
        comment: comment.trim() || null,
      });
      if (err) throw err;
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      console.error(err);
      setError('Não foi possível enviar sua avaliação agora. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setDone(false);
      setRating(0);
      setName('');
      setComment('');
      setHoneypot('');
      setError('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-white border-4 border-black rounded-3xl shadow-cartoon-xl p-6"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 bg-white border-2 border-black rounded-full p-1.5 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
              aria-label="Fechar"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {done ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="bg-accent-green/40 border-3 border-black rounded-full p-4">
                  <CheckCircle2 size={36} className="text-black" />
                </div>
                <h3 className="font-display font-bold text-xl">Valeu pela avaliação!</h3>
                <p className="text-black/60 text-sm">
                  Sua opinião ajuda outros clientes a escolher com mais confiança.
                </p>
                <Button variant="primary" onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                <div className="flex flex-col items-center text-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-xl">Avaliar {product.name}</h3>
                  <p className="text-black/60 text-sm">Como foi sua experiência com esse produto?</p>
                </div>

                <div className="flex justify-center">
                  <StarRating rating={rating} interactive size={36} onChange={setRating} />
                </div>

                <Input
                  label="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te identificar?"
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="font-display font-semibold text-sm ml-1">
                    Comentário (opcional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Conte o que achou do produto..."
                    className="border-3 border-black rounded-2xl px-4 py-3 shadow-cartoon-sm font-body resize-none"
                  />
                </div>

                {error && <p className="text-red-600 font-semibold text-sm text-center">{error}</p>}

                <Button type="submit" variant="primary" isFullWidth isLoading={submitting}>
                  Enviar avaliação
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
