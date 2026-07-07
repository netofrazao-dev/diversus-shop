-- Correção da função is_admin() — rode isso isoladamente no SQL Editor do Supabase
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$ language sql security definer stable
set search_path = public, auth;
