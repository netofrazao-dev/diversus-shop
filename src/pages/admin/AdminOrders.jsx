import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, RefreshCcw, Wallet, Clock, Trophy, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { logActivity } from '../../lib/activityLog';

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

  // ---- Busca e filtros ----
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  const updateStatus = async (order, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o))
    );
    await supabase.from('orders').update({ status }).eq('id', order.id);
    logActivity('Status do pedido alterado', {
      cliente: order.customer_name,
      de: order.status,
      para: status,
    });
  };

  // ---- Estatísticas rápidas (sempre sobre TODOS os pedidos, não filtrados) ----
  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const soldToday = orders
      .filter((o) => new Date(o.created_at) >= startOfDay && o.status !== 'cancelado')
      .reduce((sum, o) => sum + Number(o.total), 0);

    const pendingCount = orders.filter((o) => o.status === 'pendente').length;

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

  // ---- Lista filtrada exibida ----
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter && order.status !== statusFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchesName = order.customer_name?.toLowerCase().includes(term);
        const matchesPhone = order.customer_phone?.replace(/\D/g, '').includes(term.replace(/\D/g, ''));
        if (!matchesName && !matchesPhone) return false;
      }

      if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(order.created_at) > new Date(`${dateTo}T23:59:59`)) return false;

      return true;
    });
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo]);

  const hasActiveFilters = searchTerm || statusFilter || dateFrom || dateTo;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

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

      {/* Busca e filtros */}
      {!loading && orders.length > 0 && (
        <div className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
            <label className="font-display font-semibold text-xs">Buscar por nome ou telefone</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: Maria ou 91999999999"
                className="w-full border-2 border-black rounded-xl pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-xs">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-2 border-black rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-xs">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border-2 border-black rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-xs">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border-2 border-black rounded-xl px-3 py-2 text-sm"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm font-display font-semibold text-black/60 hover:text-red-600 pb-2"
            >
              <X size={16} /> Limpar
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className="font-display text-black/50">Carregando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="font-display text-black/50">Nenhum pedido recebido ainda.</p>
      ) : filteredOrders.length === 0 ? (
        <p className="font-display text-black/50">Nenhum pedido encontrado com esses filtros.</p>
      ) : (
        <div className="grid gap-4">
          {hasActiveFilters && (
            <p className="text-xs text-black/40 font-display font-semibold">
              {filteredOrders.length} de {orders.length} pedidos
            </p>
          )}
          {filteredOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
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
                onChange={(e) => updateStatus(order, e.target.value)}
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
