import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * cartStore — Estado global do carrinho (Zustand + persist no localStorage)
 *
 * Item do carrinho: { id, name, price, image_url, quantity }
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      // ---- Ações de UI ----
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      // ---- Ações do carrinho ----
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((item) => item.id === product.id);

        if (existing) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                quantity,
              },
            ],
          });
        }

        // Abre a gaveta automaticamente ao adicionar (feedback imediato)
        set({ isDrawerOpen: true });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      incrementItem: (productId) => {
        const item = get().items.find((i) => i.id === productId);
        if (item) get().updateQuantity(productId, item.quantity + 1);
      },

      decrementItem: (productId) => {
        const item = get().items.find((i) => i.id === productId);
        if (item) get().updateQuantity(productId, item.quantity - 1);
      },

      clearCart: () => set({ items: [] }),

      // ---- Seletores derivados ----
      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'diversus-shop-cart', // chave no localStorage
      partialize: (state) => ({ items: state.items }), // não persiste isDrawerOpen
    }
  )
);
