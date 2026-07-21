import { supabase } from './supabaseClient';

/**
 * logActivity — registra uma ação do admin no log de atividade.
 * Nunca trava a ação principal se o log falhar (só avisa no console).
 *
 * @param {string} action - descrição curta, ex: "Produto criado"
 * @param {object} details - contexto extra opcional, ex: { name: 'Camisa X' }
 */
export async function logActivity(action, details = null) {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from('admin_activity_log').insert({
      admin_email: data?.user?.email || null,
      action,
      details,
    });
  } catch (err) {
    console.error('Não foi possível registrar a atividade:', err);
  }
}
