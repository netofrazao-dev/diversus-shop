import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquareHeart, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import HoneypotField from '../ui/HoneypotField';

/**
 * SuggestionModal — "O que você gostaria que a gente vendesse?"
 * Salva em customer_suggestions, visível pro admin depois.
 */
export default function SuggestionModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // preenchido = bot, aborta silenciosamente
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from('customer_suggestions').insert({
        message: message.trim(),
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
    setTimeout(() => {
      setDone(false);
      setMessage('');
      setName('');
      setContact('');
      setHoneypot('');
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
                <h3 className="font-display font-bold text-xl">Valeu pela ideia!</h3>
                <p className="text-black/60 text-sm">
                  Sua sugestão chegou pra gente. Quem sabe não vira o próximo lançamento? 😉
                </p>
                <Button variant="primary" onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <HoneypotField value={honeypot} onChange={setHoneypot} />
                <div className="flex flex-col items-center text-center gap-2 mb-1">
                  <div className="bg-primary-100 border-3 border-black rounded-full p-3">
                    <MessageSquareHeart size={24} className="text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-xl">O que você quer que a gente venda?</h3>
                  <p className="text-black/60 text-sm">
                    Conta pra gente uma ideia de produto que você gostaria de ver na loja.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-display font-semibold text-sm ml-1">Sua sugestão</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    required
                    placeholder="Ex: relógios femininos rosa, cordão com pingente..."
                    className="border-3 border-black rounded-2xl px-4 py-3 shadow-cartoon-sm font-body resize-none"
                  />
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
                  placeholder="Se quiser que a gente te avise"
                />

                <Button type="submit" variant="primary" isFullWidth isLoading={submitting}>
                  Enviar sugestão
                </Button>
                <p className="text-[11px] text-black/40 text-center -mt-2">
                  Seus dados são usados só pra essa sugestão. Veja nossa{' '}
                  <Link to="/privacidade" target="_blank" className="underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
