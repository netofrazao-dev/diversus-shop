import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BellRing, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Input from '../ui/Input';
import Button from '../ui/Button';

/**
 * RestockRequestModal — Modal de interesse em produto esgotado
 *
 * Ao clicar em "Avise-me quando chegar" na PDP/Card, o cliente pode
 * (opcionalmente) deixar nome + contato. Isso é salvo em
 * `restock_requests` pra o admin ver a demanda por produto.
 */
export default function RestockRequestModal({ product, isOpen, onClose }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('restock_requests').insert({
        product_id: product.id,
        product_name: product.name,
        customer_name: name || null,
        customer_contact: contact || null,
      });
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // reseta o estado depois da animação de saída
    setTimeout(() => {
      setDone(false);
      setName('');
      setContact('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 bg-white border-4 border-black rounded-3xl shadow-cartoon-xl p-6"
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
                <h3 className="font-display font-bold text-xl">Prontinho!</h3>
                <p className="text-black/60 text-sm">
                  Anotamos seu interesse em <strong>{product.name}</strong>. Assim que chegar mais estoque, a loja vai saber que você quer!
                </p>
                <Button variant="primary" onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col items-center text-center gap-2 mb-1">
                  <div className="bg-primary-100 border-3 border-black rounded-full p-3">
                    <BellRing size={24} className="text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-xl">Avise-me quando chegar</h3>
                  <p className="text-black/60 text-sm">
                    Deixe seu nome e contato (opcional) e a loja vai saber que você quer{' '}
                    <strong>{product.name}</strong> de volta.
                  </p>
                </div>

                <Input
                  label="Seu nome (opcional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                />
                <Input
                  label="WhatsApp ou e-mail (opcional)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Pra te avisarmos diretamente"
                />

                <Button type="submit" variant="primary" isFullWidth isLoading={submitting}>
                  Quero ser avisado
                </Button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
