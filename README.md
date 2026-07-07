# DIVERSUS SHOP

E-commerce completo de acessórios (relógios, camisas, cordões) com visual cartoon/neo-brutalista, Storefront + Admin Dashboard, construído com React + Vite + Tailwind + Supabase.

## Stack

- React (Vite) + React Router DOM
- Tailwind CSS (tema cartoon: bordas grossas, sombras duras, roxo/ciano)
- Framer Motion + Lucide React
- Zustand (carrinho) + React Query (dados)
- Supabase (Postgres, Auth, Storage, RLS)
- ViaCEP (auto-preenchimento de endereço) + WhatsApp (wa.me) no checkout

## 1. Instalação

```bash
npm install
```

## 2. Configurar o Supabase

1. Crie um projeto em https://supabase.com
2. No **SQL Editor** do projeto, rode o arquivo `supabase_schema.sql` (está na raiz deste projeto). Ele cria todas as tabelas, RLS, policies e o bucket de imagens.
3. Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_STORE_WHATSAPP=5591999999999
```

Essas duas primeiras chaves ficam em **Project Settings > API** no painel do Supabase.

## 3. Criar o usuário admin

1. Vá em **Authentication > Users** no Supabase e crie um usuário (e-mail + senha) — esse será o login do painel administrativo.
2. Copie o **UUID** desse usuário.
3. No SQL Editor, rode:

```sql
insert into public.admins (id, full_name)
values ('UUID-DO-USUARIO-AQUI', 'Nome do Admin');
```

Isso libera esse usuário para logar em `/admin/login` e ter permissão de escrita (RLS) em produtos e leitura de pedidos.

## 4. Rodar o projeto

```bash
npm run dev
```

Acesse `http://localhost:5173`.

- Loja: `/`
- Catálogo: `/catalogo`
- Admin: `/admin/login`

## 5. Fluxo de compra (sem gateway de pagamento)

O cliente adiciona produtos ao carrinho (Zustand + persistido no localStorage), preenche o CEP no checkout (auto-preenchido via ViaCEP), e ao confirmar:
1. O pedido é salvo nas tabelas `orders` / `order_items` do Supabase.
2. O WhatsApp abre automaticamente (`wa.me`) com uma mensagem formatada contendo os dados do cliente, endereço e itens — pronta para enviar à loja.

## 6. Painel administrativo

Login protegido por Supabase Auth (`/admin/login`). Dentro do painel:
- **Pedidos**: lista todos os pedidos recebidos com opção de atualizar o status (pendente → confirmado → enviado → entregue / cancelado).
- **Produtos**: CRUD completo — criar, editar, excluir produtos, com upload de imagem direto para o Supabase Storage (bucket `product-images`).

## 7. Build de produção

```bash
npm run build
npm run preview
```

## 8. Deploy no GitHub Pages

O projeto já vem configurado pra funcionar em hospedagens estáticas (usa `HashRouter`, então as rotas não quebram ao dar refresh):

```bash
npm install
npm run deploy
```

Isso builda o projeto e publica a pasta `dist/` na branch `gh-pages` do seu repositório (via pacote `gh-pages`, já incluso). Depois, no GitHub:
1. Vá em **Settings > Pages**
2. Em "Branch", selecione `gh-pages` / `root`
3. Aguarde alguns minutos e acesse o link gerado

⚠️ Lembre de configurar as variáveis de ambiente (`.env.local`) **antes** de rodar `npm run deploy` — o Vite "grava" essas variáveis no build final.

## 9. Produtos esgotados e lista de desejos

No painel Admin (**Produtos**), marque a caixinha **"Esgotado"** ao criar/editar um produto. Isso faz com que:
- O card e a página do produto mostrem a tag **ESGOTADO** e a imagem fique acinzentada
- O botão de compra vire **"Avise-me quando chegar"**
- Ao clicar, o cliente pode (opcionalmente) deixar nome e contato — isso fica salvo e visível na aba **Desejos** do Admin, agrupado por produto, mostrando quantas pessoas querem cada item de volta.

## Estrutura de pastas

```
src/
├── components/
│   ├── ui/         # Button, Input, Badge
│   ├── layout/      # Navbar, Footer, CartDrawer
│   └── product/       # ProductCard, ProductSection
├── pages/
│   ├── Home.jsx, Catalog.jsx, ProductDetail.jsx, Checkout.jsx
│   └── admin/       # AdminLogin, AdminDashboard, AdminOrders, AdminProducts
├── store/            # cartStore (Zustand)
├── lib/              # supabaseClient, viaCep, whatsapp
├── hooks/             # useProducts (React Query), useAuth
├── routes/            # AppRoutes, ProtectedRoute
└── App.jsx, main.jsx, index.css
```
