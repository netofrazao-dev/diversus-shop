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

## 10. Categorias, promoções, produtos ocultos, recomendações, combos e variações

No Admin agora você tem:

- **Categorias** (`/admin/categorias`): crie, edite e exclua categorias livremente — não precisa mais mexer no SQL pra isso.
- **Ocultar produto**: no formulário de produto, desmarque "Visível na loja" — o produto some da loja mas continua salvo no admin (diferente de excluir).
- **Promoção**: preencha "Preço promocional" (e opcionalmente uma data de início/fim) — a loja mostra automaticamente o preço promocional com o valor antigo riscado, dentro da janela escolhida. Sem data = promoção ativa enquanto o preço estiver preenchido.
- **Variações** (cor, tamanho, sabor...): crie grupos (ex: "Tamanho") com seus valores (ex: "P", "M", "G"), cada um podendo ter um ajuste de preço (ex: tamanho G custa +R$5) e podendo ser marcado como esgotado individualmente. Na página do produto, o cliente escolhe as opções antes de adicionar ao carrinho.
- **Recomendações** ("Você também pode gostar"): marque quais outros produtos aparecem recomendados na página deste produto.
- **Combos** (compre junto e ganhe desconto): escolha outro produto e um desconto (percentual ou valor fixo) que se aplica quando os dois estão no carrinho. O desconto é aplicado automaticamente no carrinho e no checkout.

## 12. Caixinha de sugestões, Instagram e recomendações automáticas

- **Sugestão de produto**: no rodapé ("Sugerir um produto") e na Home tem um formulário onde o cliente conta o que gostaria de ver na loja. Veja tudo em `/admin/sugestoes`.
- **Instagram**: banner grande na Home, banner compacto na página de produto e no rodapé, todos apontando pro seu perfil real (`@diversus__shop.acessorios`). Depois de finalizar uma compra, o cliente volta pra Home e vê um convite pra seguir o Instagram.
- **Recomendações automáticas**: se você não cadastrar recomendações manuais pra um produto (na aba "Recomendações" do formulário), o site já sugere sozinho — primeiro tenta produtos da mesma categoria, e se não achar, cai pros produtos em destaque. Se você cadastrar manualmente, isso tem prioridade sobre o automático.

## 13. Build de produção

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
