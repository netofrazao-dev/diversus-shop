import { useState } from 'react';
import { Search, Package, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const STATUS_LABELS = {
  pendente: { label: 'Pendente', color: 'bg-accent-yellow' },
  confirmado: { label: 'Confirmado', color: 'bg-secondary' },
  enviado: { label: 'Enviado', color: 'bg-primary-200' },
  entregue: { label: 'Entregue', color: 'bg-accent-green' },
  cancelado: { label: 'Cancelado', color: 'bg-accent-pink' },
};

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function OrderTracking() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    setOrders(null);

    try {
      const { data, error: err } = await supabase.rpc('track_orders_by_phone', {
        p_phone: phone,
      });

      if (err) throw err;

      if (!data || data.length === 0) {
        setError('Nenhum pedido encontrado com esse telefone. Confira se digitou igual usou na compra.');
      } else {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível consultar agora. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col items-center text-center gap-2 mb-8">
        <div className="bg-primary border-3 border-black rounded-2xl p-3 shadow-cartoon-sm">
          <Package size={28} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl">Consultar meu pedido</h1>
        <p className="text-black/60">
          Digite o telefone que você usou na compra pra ver o status dos seus pedidos.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(00) 00000-0000"
          containerClassName="flex-1"
        />
        <Button type="submit" variant="primary" icon={Search} isLoading={loading}>
          Consultar
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {error && (
        <p className="text-center font-display font-semibold text-black/60 bg-accent-pink/20 border-2 border-black rounded-2xl px-4 py-3">
          {error}
        </p>
      )}

      {orders && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pendente;
            return (
              <div
                key={order.id}
                className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-mono text-black/40">
                    Pedido #{order.id.slice(0, 8)}
                  </span>
                  <span
                    className={`text-xs font-display font-bold border-2 border-black rounded-full px-3 py-0.5 ${statusInfo.color}`}
                  >
                    {statusInfo.label.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-black/50 flex items-center gap-1.5">
                  <MapPin size={13} />
                  {order.street}, {order.number}
                  {order.complement ? ` - ${order.complement}` : ''} — {order.neighborhood}
                </p>

                <div className="flex flex-col gap-1.5 border-t-2 border-black/10 pt-3">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-black/70">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-semibold">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.coupon_code && (
                  <p className="text-xs font-semibold text-green-700">
                    🎟️ Cupom {order.coupon_code} (-{formatPrice(order.coupon_discount)})
                  </p>
                )}

                <div className="flex justify-between items-center border-t-2 border-black/10 pt-3">
                  <span className="font-display font-semibold">Total</span>
                  <span className="font-display font-bold text-xl text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>

                <p className="text-xs text-black/40 text-right">
                  {new Date(order.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
