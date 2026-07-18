import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * cartStore — Estado global do carrinho (Zustand + persist no localStorage)
 *
 * Item do carrinho: { id, productId, name, price, image_url, quantity, variantLabel }
 * - "id" é único por produto+variação (ex: "abc123::Tamanho:M|Cor:Azul")
 * - "productId" é o id real do produto (usado pra checar combos)
 *
 * Combo: { id, productAId, productBId, productAName, productBName, discountPercent, discountAmount }
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      combos: [], // combos "ativados" pelo cliente (quando ele clica em "adicionar os dois")
      isDrawerOpen: false,

      // ---- Ações de UI ----
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      // ---- Ações do carrinho ----
      // product: objeto do produto. variant (opcional): { label, priceAdjustment, signature }
      addItem: (product, quantity = 1, variant = null) => {
        const items = get().items;
        const lineId = variant ? `${product.id}::${variant.signature}` : product.id;
        const unitPrice = (product.promo_price ?? product.price) + (variant?.priceAdjustment || 0);

        const existing = items.find((item) => item.id === lineId);

        if (existing) {
          set({
            items: items.map((item) =>
              item.id === lineId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: lineId,
                productId: product.id,
                name: product.name,
                price: unitPrice,
                image_url: product.image_url,
                quantity,
                variantLabel: variant?.label || null,
              },
            ],
          });
        }

        set({ isDrawerOpen: true });
      },

      // Adiciona dois produtos de uma vez (combo) e registra o desconto do par.
      // variantA: variação já selecionada do produto atual (se houver), pra não
      // perder a escolha de cor/tamanho ao usar o atalho "adicionar os dois".
      addCombo: (comboDefinition, productA, productB, variantA = null) => {
        const { addItem } = get();
        addItem(productA, 1, variantA);
        addItem(productB, 1);

        set((state) => {
          const alreadyExists = state.combos.some((c) => c.id === comboDefinition.id);
          if (alreadyExists) return state;
          return {
            combos: [
              ...state.combos,
              {
                id: comboDefinition.id,
                productAId: productA.id,
                productBId: productB.id,
                productAName: productA.name,
                productBName: productB.name,
                discountPercent: comboDefinition.discount_percent || null,
                discountAmount: comboDefinition.discount_amount || null,
              },
            ],
          };
        });
      },

      removeItem: (lineId) => {
        set({ items: get().items.filter((item) => item.id !== lineId) });
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity < 1) {
          get().removeItem(lineId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === lineId ? { ...item, quantity } : item
          ),
        });
      },

      incrementItem: (lineId) => {
        const item = get().items.find((i) => i.id === lineId);
        if (item) get().updateQuantity(lineId, item.quantity + 1);
      },

      decrementItem: (lineId) => {
        const item = get().items.find((i) => i.id === lineId);
        if (item) get().updateQuantity(lineId, item.quantity - 1);
      },

      clearCart: () => set({ items: [], combos: [] }),

      // ---- Seletores derivados ----
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      // Total "cheio", sem descontos de combo
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      // Soma de todos os descontos de combo que se aplicam de verdade
      // (só conta se os DOIS produtos do combo ainda estiverem no carrinho)
      getComboDiscount: () => {
        const { items, combos } = get();

        const qtyByProduct = {};
        items.forEach((item) => {
          qtyByProduct[item.productId] = (qtyByProduct[item.productId] || 0) + item.quantity;
        });

        return combos.reduce((totalDiscount, combo) => {
          const qtyA = qtyByProduct[combo.productAId] || 0;
          const qtyB = qtyByProduct[combo.productBId] || 0;
          const pairs = Math.min(qtyA, qtyB);
          if (pairs === 0) return totalDiscount;

          const itemA = items.find((i) => i.productId === combo.productAId);
          const itemB = items.find((i) => i.productId === combo.productBId);
          if (!itemA || !itemB) return totalDiscount;

          let discountPerPair = 0;
          if (combo.discountPercent) {
            discountPerPair = ((itemA.price + itemB.price) * combo.discountPercent) / 100;
          } else if (combo.discountAmount) {
            discountPerPair = combo.discountAmount;
          }

          return totalDiscount + discountPerPair * pairs;
        }, 0);
      },

      getTotalPrice: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getComboDiscount();
        return Math.max(0, subtotal - discount);
      },
    }),
    {
      name: 'diversus-shop-cart',
      partialize: (state) => ({ items: state.items, combos: state.combos }),
    }
  )
);
