import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareHeart, RefreshCcw, Trash2, User, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customer_suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setSuggestions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  const handleDelete = async (id) => {
    await supabase.from('customer_suggestions').delete().eq('id', id);
    loadSuggestions();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
            <MessageSquareHeart size={26} /> Sugestões dos clientes
          </h1>
          <p className="text-black/60 text-sm mt-1">
            Ideias de produtos que os clientes gostariam de ver na loja.
          </p>
        </div>
        <button
          onClick={loadSuggestions}
          className="flex items-center gap-2 bg-white border-2 border-black rounded-xl px-4 py-2 font-display font-semibold text-sm shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
        >
          <RefreshCcw size={16} /> Atualizar
        </button>
      </div>

      {loading ? (
        <p className="font-display text-black/50">Carregando...</p>
      ) : suggestions.length === 0 ? (
        <p className="font-display text-black/50">Nenhuma sugestão recebida ainda.</p>
      ) : (
        <div className="grid gap-3">
          {suggestions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-body text-black">{s.message}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-black/50">
                    <User size={12} /> {s.customer_name || 'Anônimo'}
                  </span>
                  {s.customer_contact && (
                    <span className="flex items-center gap-1.5 text-xs text-black/50">
                      <Phone size={12} /> {s.customer_contact}
                    </span>
                  )}
                  <span className="text-xs text-black/30">
                    {new Date(s.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm text-red-600 active:translate-y-0.5 active:shadow-none shrink-0"
                aria-label="Remover"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
