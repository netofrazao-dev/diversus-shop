import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border-4 border-black rounded-3xl shadow-cartoon-lg p-8 flex flex-col gap-5"
      >
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="bg-primary border-3 border-black rounded-2xl w-14 h-14 flex items-center justify-center shadow-cartoon">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl">Painel Admin</h1>
          <p className="text-sm text-black/60 text-center">DIVERSUS SHOP</p>
        </div>

        <Input
          label="E-mail"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@diversus.shop"
          required
        />
        <Input
          label="Senha"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && <p className="text-red-600 text-sm font-semibold text-center">{error}</p>}

        <Button type="submit" variant="primary" size="lg" isFullWidth isLoading={loading}>
          Entrar
        </Button>
      </form>
    </div>
  );
}
