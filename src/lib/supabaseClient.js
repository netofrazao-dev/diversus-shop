import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    'Configuração ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente do seu provedor de hospedagem (Netlify/Vercel/etc.) e faça o redeploy.';

  console.error('[DIVERSUS SHOP] ' + message);

  // Mostra um aviso amigável na tela em vez de deixar a página em branco
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;background:#fff;">
          <div style="max-width:480px;text-align:center;border:3px solid #000;border-radius:20px;padding:32px;box-shadow:6px 6px 0 0 #000;">
            <h1 style="font-size:20px;margin-bottom:12px;">⚠️ Configuração pendente</h1>
            <p style="color:#444;line-height:1.5;">${message}</p>
          </div>
        </div>
      `;
    }
  });
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
