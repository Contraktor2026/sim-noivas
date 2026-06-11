-- ============================================================
-- SIM. — esquema do banco (Supabase / Postgres)
-- Rode este arquivo inteiro em: SQL Editor → New query → Run
-- ============================================================

-- Estado do app: um registro por usuária (JSON com perfil,
-- despesas, fornecedores, tarefas e anotações)
create table if not exists public.app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Anexos (orçamentos e contratos) em base64
create table if not exists public.app_files (
  user_id    uuid not null references auth.users(id) on delete cascade,
  id         text not null,
  mime       text,
  data       text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------- Segurança: cada usuária só enxerga o que é dela ----------
alter table public.app_state enable row level security;
alter table public.app_files enable row level security;

create policy "estado: ler o próprio"
  on public.app_state for select using (auth.uid() = user_id);
create policy "estado: criar o próprio"
  on public.app_state for insert with check (auth.uid() = user_id);
create policy "estado: atualizar o próprio"
  on public.app_state for update using (auth.uid() = user_id);
create policy "estado: apagar o próprio"
  on public.app_state for delete using (auth.uid() = user_id);

create policy "arquivos: ler os próprios"
  on public.app_files for select using (auth.uid() = user_id);
create policy "arquivos: criar os próprios"
  on public.app_files for insert with check (auth.uid() = user_id);
create policy "arquivos: atualizar os próprios"
  on public.app_files for update using (auth.uid() = user_id);
create policy "arquivos: apagar os próprios"
  on public.app_files for delete using (auth.uid() = user_id);

-- Limite de tamanho por anexo (~3,6 MB em base64), proteção básica
alter table public.app_files
  add constraint app_files_tamanho check (length(data) < 3800000);
