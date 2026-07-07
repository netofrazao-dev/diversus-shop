import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, RefreshCcw, Trash2, ChevronDown, ChevronUp, User, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminRestockRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('restock_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDelete = async (id) => {
    await supabase.from('restock_requests').delete().eq('id', id);
    loadRequests();
  };

  const handleClearProduct = async (productId, requestIds) => {
    if (!confirm('Marcar como resolvido? Isso vai apagar todos os pedidos de aviso deste produto.')) return;
    await supabase.from('restock_requests').delete().in('id', requestIds);
    loadRequests();
  };

  // Agrupa os pedidos por produto
  const grouped = requests.reduce((acc, req) => {
    const key = req.product_id || req.product_name;
    if (!acc[key]) {
      acc[key] = {
        productId: req.product_id,
        productName: req.product_name,
        items: [],
      };
    }
    acc[key].items.push(req);
    return acc;
  }, {});

  const groups = Object.values(grouped).sort((a, b) => b.items.length - a.items.length);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
            <BellRing size={26} /> Desejos de reposição
          </h1>
          <p className="text-black/60 text-sm mt-1">
            Produtos esgotados que os clientes pediram pra voltar ao estoque.
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="flex items-center gap-2 bg-white border-2 border-black rounded-xl px-4 py-2 font-display font-semibold text-sm shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
        >
          <RefreshCcw size={16} /> Atualizar
        </button>
      </div>

      {loading ? (
        <p className="font-display text-black/50">Carregando...</p>
      ) : groups.length === 0 ? (
        <p className="font-display text-black/50">
          Ninguém pediu reposição de nenhum produto ainda.
        </p>
      ) : (
        <div className="grid gap-4">
          {groups.map((group, i) => {
            const key = group.productId || group.productName;
            const isExpanded = expandedProduct === key;
            const requestIds = group.items.map((r) => r.id);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm overflow-hidden"
              >
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="bg-primary text-white font-display font-bold text-lg border-2 border-black rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow-cartoon-sm">
                      {group.items.length}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-semibold truncate">{group.productName}</p>
                      <p className="text-sm text-black/50">
                        {group.items.length === 1
                          ? '1 pessoa quer esse produto de volta'
                          : `${group.items.length} pessoas querem esse produto de volta`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleClearProduct(group.productId, requestIds)}
                      className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm text-red-600 active:translate-y-0.5 active:shadow-none"
                      aria-label="Marcar como resolvido"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => setExpandedProduct(isExpanded ? null : key)}
                      className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none"
                      aria-label="Expandir"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t-2 border-black bg-primary-50/40 p-4 flex flex-col gap-2">
                    {group.items.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white border-2 border-black rounded-xl px-4 py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="flex items-center gap-1.5 text-sm font-semibold">
                            <User size={13} />
                            {req.customer_name || 'Anônimo'}
                          </span>
                          {req.customer_contact && (
                            <span className="flex items-center gap-1.5 text-xs text-black/60">
                              <Phone size={12} />
                              {req.customer_contact}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="text-red-500 hover:text-red-700 shrink-0"
                          aria-label="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
