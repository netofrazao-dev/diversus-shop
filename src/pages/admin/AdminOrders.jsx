import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, RefreshCcw, Wallet, Clock, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const STATUS_OPTIONS = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];

const STATUS_COLORS = {
  pendente: 'bg-accent-yellow',
  confirmado: 'bg-secondary',
  enviado: 'bg-primary-200',
  entregue: 'bg-accent-green',
  cancelado: 'bg-accent-pink',
};

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    await supabase.from('orders').update({ status }).eq('id', orderId);
  };

  // ---- Estatísticas rápidas ----
  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const soldToday = orders
      .filter((o) => new Date(o.created_at) >= startOfDay && o.status !== 'cancelado')
      .reduce((sum, o) => sum + Number(o.total), 0);

    const pendingCount = orders.filter((o) => o.status === 'pendente').length;

    // Produto mais vendido nos últimos 7 dias (por quantidade)
    const qtyByProduct = {};
    orders
      .filter((o) => new Date(o.created_at) >= sevenDaysAgo && o.status !== 'cancelado')
      .forEach((o) => {
        (o.order_items || []).forEach((item) => {
          qtyByProduct[item.product_name] = (qtyByProduct[item.product_name] || 0) + item.quantity;
        });
      });

    let topProduct = null;
    let topQty = 0;
    Object.entries(qtyByProduct).forEach(([name, qty]) => {
      if (qty > topQty) {
        topProduct = name;
        topQty = qty;
      }
    });

    return { soldToday, pendingCount, topProduct, topQty };
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl sm:text-3xl">Pedidos</h1>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 bg-white border-2 border-black rounded-xl px-4 py-2 font-display font-semibold text-sm shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
        >
          <RefreshCcw size={16} /> Atualizar
        </button>
      </div>

      {/* Estatísticas rápidas */}
      {!loading && orders.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex items-center gap-3">
            <div className="bg-accent-green/40 border-2 border-black rounded-full p-2.5 shrink-0">
              <Wallet size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-display font-semibold text-black/50">Vendido hoje</p>
              <p className="font-display font-bold text-xl truncate">{formatPrice(stats.soldToday)}</p>
            </div>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex items-center gap-3">
            <div className="bg-accent-yellow/60 border-2 border-black rounded-full p-2.5 shrink-0">
              <Clock size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-display font-semibold text-black/50">Pedidos pendentes</p>
              <p className="font-display font-bold text-xl">{stats.pendingCount}</p>
            </div>
          </div>

          <div className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex items-center gap-3">
            <div className="bg-secondary/40 border-2 border-black rounded-full p-2.5 shrink-0">
              <Trophy size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-display font-semibold text-black/50">Mais vendido (7 dias)</p>
              <p className="font-display font-bold text-sm truncate">
                {stats.topProduct ? `${stats.topProduct} (${stats.topQty}x)` : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="font-display text-black/50">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="font-display text-black/50">Nenhum pedido recebido ainda.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-lg">{order.customer_name}</p>
                  <span
                    className={`text-xs font-display font-bold border-2 border-black rounded-full px-3 py-0.5 ${STATUS_COLORS[order.status]}`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-black/60 flex items-center gap-1.5 mt-1">
                  <Phone size={14} /> {order.customer_phone}
                </p>
                <p className="text-sm text-black/60 flex items-center gap-1.5">
                  <MapPin size={14} />
                  {order.street}, {order.number}
                  {order.complement ? ` - ${order.complement}` : ''} — {order.neighborhood}
                </p>
                <p className="text-sm mt-2 text-black/70">
                  {order.order_items?.length || 0} item(ns) —{' '}
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                </p>
                {order.coupon_code && (
                  <p className="text-xs mt-1 font-display font-semibold text-green-700">
                    🎟️ Cupom {order.coupon_code} (-{formatPrice(order.coupon_discount)})
                  </p>
                )}
              </div>

              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="border-2 border-black rounded-xl px-3 py-2 font-display font-semibold text-sm bg-white shadow-cartoon-sm"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
