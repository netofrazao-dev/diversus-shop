import { Component } from 'react';

/**
 * ErrorBoundary — rede de segurança pra erros de renderização.
 *
 * Sem isso, se QUALQUER componente quebrar (ex: um erro de programação
 * numa atualização futura), o React desmonta a árvore inteira e o
 * cliente vê uma TELA BRANCA — sem entender o que houve.
 *
 * Com isso, o cliente vê uma mensagem amigável e um botão pra recarregar,
 * e o erro fica registrado no console pra você investigar depois.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro capturado pela ErrorBoundary:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = import.meta.env.BASE_URL || '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-white">
          <div className="bg-primary-50 border-4 border-black rounded-3xl shadow-cartoon-lg p-8 max-w-md flex flex-col items-center gap-3">
            <span className="text-5xl">🛠️</span>
            <h1 className="font-display font-bold text-2xl">Ops! Algo deu errado</h1>
            <p className="text-black/60">
              Tivemos um probleminha ao carregar essa parte do site. Tente recarregar — se
              continuar, fale com a gente pelo WhatsApp ou Instagram.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-primary text-white border-3 border-black rounded-2xl px-6 py-3 font-display font-bold shadow-cartoon active:translate-y-1 active:shadow-none transition-all"
            >
              Recarregar a loja
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
