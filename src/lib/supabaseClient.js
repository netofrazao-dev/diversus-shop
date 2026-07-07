import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[DIVERSUS SHOP] Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas em .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
