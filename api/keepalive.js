/**
 * /api/keepalive — mantém o banco do Supabase acordado.
 *
 * POR QUE ISSO EXISTE:
 * No plano gratuito, o Supabase PAUSA o projeto depois de 7 dias sem
 * nenhuma atividade. Se isso acontecer, a loja sai do ar até alguém
 * entrar no painel do Supabase e despausar na mão.
 *
 * Esta função faz uma consulta mínima no banco (busca 1 id de produto),
 * o que já conta como atividade. O Vercel chama ela automaticamente todo
 * dia (configurado no vercel.json), então o banco nunca fica 7 dias parado.
 *
 * Não precisa de nenhuma variável nova: reaproveita as mesmas
 * VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY que a loja já usa.
 */
export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({
      ok: false,
      error:
        'VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não estão configuradas nas variáveis de ambiente do Vercel.',
    });
  }

  try {
    // Consulta mais barata possível: 1 coluna, 1 linha.
    const response = await fetch(`${url}/rest/v1/products?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({
        ok: false,
        status: response.status,
        error: 'O Supabase respondeu com erro.',
        detail: detail.slice(0, 300),
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Banco acordado com sucesso.',
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'Não foi possível falar com o Supabase.',
      detail: String(err).slice(0, 300),
    });
  }
}
