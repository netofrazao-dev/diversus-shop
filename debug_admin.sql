-- PASSO 1: veja o UUID e e-mail do usuário que você usa para logar em /admin/login
select id, email from auth.users;

-- PASSO 2: veja quem está cadastrado como admin (compare o UUID com o de cima)
select * from public.admins;

-- PASSO 3: liste as policies criadas no bucket de imagens (deve mostrar 4 linhas)
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like 'product_images%';

-- PASSO 4: teste de verdade se is_admin() retornaria true PARA O SEU USUÁRIO
-- (troque 'UUID-DO-USUARIO-AQUI' pelo UUID que apareceu no PASSO 1)
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"UUID-DO-USUARIO-AQUI"}';
  select public.is_admin() as deveria_ser_true;
rollback;
