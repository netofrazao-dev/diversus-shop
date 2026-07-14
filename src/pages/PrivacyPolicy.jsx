import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1 font-display font-semibold text-sm mb-6 hover:underline"
      >
        <ChevronLeft size={18} /> Voltar para a loja
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary border-3 border-black rounded-2xl p-2.5 shadow-cartoon-sm">
          <ShieldCheck size={26} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Política de Privacidade</h1>
      </div>

      <div className="bg-white border-3 border-black rounded-3xl shadow-cartoon p-6 sm:p-8 flex flex-col gap-6 font-body text-black/80 leading-relaxed">
        <p className="text-sm text-black/50">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">1. Quem somos</h2>
          <p>
            A DIVERSUS SHOP é uma loja de acessórios. Esta política explica quais dados coletamos
            de você ao usar nosso site, para que servem e quais são os seus direitos, em conformidade
            com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">2. Quais dados coletamos</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li><strong>Ao finalizar uma compra:</strong> nome, telefone/WhatsApp, e-mail (opcional) e endereço de entrega.</li>
            <li><strong>Ao pedir aviso de reposição de um produto esgotado:</strong> nome e contato (ambos opcionais).</li>
            <li><strong>Ao enviar uma sugestão de produto:</strong> sua mensagem e, se você quiser, nome e contato.</li>
            <li><strong>Automaticamente:</strong> itens que você adiciona ao carrinho (guardados só no seu navegador, não em nossos servidores).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">3. Para que usamos esses dados</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Processar e entregar seu pedido, incluindo contato via WhatsApp para combinar pagamento e entrega.</li>
            <li>Avisar você quando um produto de seu interesse voltar ao estoque.</li>
            <li>Avaliar sugestões de novos produtos para a loja.</li>
            <li>Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">4. Onde seus dados ficam armazenados</h2>
          <p>
            Os dados ficam armazenados de forma segura na plataforma Supabase, com controle de acesso
            restrito apenas à administração da loja. Não utilizamos seus dados de pagamento — o
            pagamento é combinado diretamente com você pelo WhatsApp.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">5. Seus direitos</h2>
          <p>De acordo com a LGPD, você pode a qualquer momento solicitar:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 mt-1.5">
            <li>Confirmação de que tratamos seus dados e acesso a eles;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Exclusão dos seus dados armazenados;</li>
            <li>Informação sobre com quem compartilhamos seus dados (no nosso caso, ninguém além da Supabase, que hospeda os dados).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">6. Como falar com a gente</h2>
          <p>
            Para exercer qualquer um desses direitos ou tirar dúvidas sobre esta política, entre em
            contato pelo WhatsApp ou Instagram da loja, disponíveis no rodapé do site.
          </p>
        </section>
      </div>
    </div>
  );
}
