import { Link } from 'react-router-dom';
import { RotateCcw, ChevronLeft } from 'lucide-react';
import { STORE_LEGAL_NAME, STORE_DOCUMENT, hasLegalInfo } from '../lib/constants';

export default function ReturnsPolicy() {
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
          <RotateCcw size={26} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Trocas e Devoluções</h1>
      </div>

      <div className="bg-white border-3 border-black rounded-3xl shadow-cartoon p-6 sm:p-8 flex flex-col gap-6 font-body text-black/80 leading-relaxed">
        <p className="text-sm text-black/50">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <section className="bg-primary-50 border-2 border-black rounded-2xl p-4">
          <h2 className="font-display font-bold text-lg text-black mb-2">
            Você tem 7 dias pra se arrepender da compra
          </h2>
          <p>
            De acordo com o <strong>Código de Defesa do Consumidor (Art. 49, Lei nº 8.078/1990)</strong>,
            toda compra feita fora de loja física — como pela internet — dá direito a desistir da compra
            em até <strong>7 dias corridos</strong>, contados a partir do dia em que você recebeu o
            produto. Esse é o chamado <strong>direito de arrependimento</strong>, e não é preciso dar
            nenhum motivo ou justificativa.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">Como pedir a devolução</h2>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>Entre em contato pelo WhatsApp ou Instagram da loja (rodapé do site) dentro do prazo de 7 dias</li>
            <li>Informe o número do seu pedido (você encontra em "Consultar meu pedido", no rodapé)</li>
            <li>Combine com a gente a forma de devolver o produto</li>
            <li>Assim que recebermos o produto de volta, o reembolso é feito</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">Condições do produto</h2>
          <p>
            Pra garantir o reembolso integral, o produto precisa estar sem sinais de uso, com a
            embalagem original e todos os acessórios que vieram junto. Isso protege tanto você quanto
            a loja — produtos danificados ou usados podem ter o reembolso reduzido proporcionalmente,
            conforme avaliação caso a caso.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">Produto com defeito</h2>
          <p>
            Se o produto chegou com defeito ou diferente do anunciado, isso <strong>não conta como
            arrependimento</strong> — é garantia, e você tem até <strong>90 dias</strong> (bens duráveis)
            pra reclamar, com troca, reparo ou reembolso, sem custo nenhum pra você. Fale com a gente o
            quanto antes se isso acontecer.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-black mb-2">Quem é responsável</h2>
          <p>
            {hasLegalInfo() ? (
              <>
                {STORE_LEGAL_NAME} — {STORE_DOCUMENT}
              </>
            ) : (
              <>
                DIVERSUS SHOP.{' '}
                <span className="text-black/40 text-sm">
                  (a loja ainda precisa preencher a razão social e o CNPJ/CPF nas configurações do site)
                </span>
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
