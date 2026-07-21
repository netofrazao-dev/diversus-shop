import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, RefreshCcw, User } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminActivityLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error) setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
            <History size={26} /> Log de atividade
          </h1>
          <p className="text-black/60 text-sm mt-1">
            Últimas ações feitas no painel — útil se mais de uma pessoa administra a loja.
          </p>
        </div>
        <button
          onClick={loadEntries}
          className="flex items-center gap-2 bg-white border-2 border-black rounded-xl px-4 py-2 font-display font-semibold text-sm shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
        >
          <RefreshCcw size={16} /> Atualizar
        </button>
      </div>

      {loading ? (
        <p className="font-display text-black/50">Carregando...</p>
      ) : entries.length === 0 ? (
        <p className="font-display text-black/50">Nenhuma atividade registrada ainda.</p>
      ) : (
        <div className="grid gap-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.01, 0.3) }}
              className="bg-white border-2 border-black rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm">{entry.action}</p>
                {entry.details && (
                  <p className="text-xs text-black/50 truncate">
                    {Object.entries(entry.details)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-black/40 shrink-0">
                <span className="flex items-center gap-1">
                  <User size={12} /> {entry.admin_email || 'desconhecido'}
                </span>
                <span>
                  {new Date(entry.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
