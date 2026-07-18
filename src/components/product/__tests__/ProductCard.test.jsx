import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';

/**
 * Estes testes travam o bug encontrado na varredura de ponta a ponta:
 * o botão "Adicionar" do card de produto (Catálogo/Home) deixava
 * adicionar ao carrinho um produto com variação obrigatória (cor,
 * tamanho...) SEM passar pela escolha da variação. Se algum dia esse
 * comportamento voltar a quebrar, é aqui que vai aparecer vermelho.
 */

const baseProduct = {
  id: 'produto-1',
  name: 'Camisa Teste',
  price: 50,
  image_url: null,
  is_featured: false,
  is_new: false,
  is_sold_out: false,
  has_variants: false,
};

function renderCard(product, onAddToCart = vi.fn()) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} onAddToCart={onAddToCart} />
    </MemoryRouter>
  );
}

describe('ProductCard — variação obrigatória', () => {
  it('produto SEM variação: mostra "Adicionar" e chama onAddToCart ao clicar', () => {
    const onAddToCart = vi.fn();
    renderCard({ ...baseProduct, has_variants: false }, onAddToCart);

    const button = screen.getByRole('button', { name: /adicionar/i });
    fireEvent.click(button);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 'produto-1' }));
  });

  it('produto COM variação obrigatória: NÃO mostra botão de adicionar direto — mostra "Ver opções"', () => {
    const onAddToCart = vi.fn();
    renderCard({ ...baseProduct, has_variants: true }, onAddToCart);

    // O botão de adicionar direto não deve existir mais
    expect(screen.queryByRole('button', { name: /^adicionar$/i })).not.toBeInTheDocument();

    // Em vez disso, deve existir "Ver opções" — um link pra página do produto
    const verOpcoes = screen.getByText(/ver opções/i);
    expect(verOpcoes).toBeInTheDocument();

    // Clicar nele NÃO deve adicionar ao carrinho diretamente (é um link, não um addToCart)
    fireEvent.click(verOpcoes);
    expect(onAddToCart).not.toHaveBeenCalled();
  });

  it('produto esgotado: mostra "Avise-me" independente de ter variação', () => {
    renderCard({ ...baseProduct, is_sold_out: true, has_variants: true });
    expect(screen.getByRole('button', { name: /avise-me/i })).toBeInTheDocument();
  });
});
