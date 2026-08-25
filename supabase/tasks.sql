-- Run this in the Supabase SQL Editor.
-- Existing tasks without a user_id will no longer be visible to anyone.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(trim(text)) > 0),
  completed boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.tasks
add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- New rows automatically belong to the authenticated Supabase user.
alter table public.tasks alter column user_id set default auth.uid();
alter table public.tasks enable row level security;

-- PostgreSQL permissions and RLS are separate layers. The authenticated role
-- needs these table privileges before the policies below can be evaluated.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;

-- Remove the temporary public policies from the previous version.
drop policy if exists "Anyone can read tasks" on public.tasks;
drop policy if exists "Anyone can add tasks" on public.tasks;
drop policy if exists "Anyone can update tasks" on public.tasks;
drop policy if exists "Anyone can delete tasks" on public.tasks;

-- A signed-in user can only work with rows whose user_id matches auth.uid().
drop policy if exists "Users can read their own tasks" on public.tasks;
create policy "Users can read their own tasks"
on public.tasks for select
to authenticated
using ((select auth.uid()) = user_id);

-- Optional verification queries (run after the statements above):
-- select relrowsecurity from pg_class where oid = 'public.tasks'::regclass;
-- select policyname, roles, cmd from pg_policies where schemaname = 'public' and tablename = 'tasks';
-- select grantee, privilege_type from information_schema.role_table_grants
-- where table_schema = 'public' and table_name = 'tasks' and grantee = 'authenticated';

drop policy if exists "Users can add their own tasks" on public.tasks;
create policy "Users can add their own tasks"
on public.tasks for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
on public.tasks for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
on public.tasks for delete
to authenticated
using ((select auth.uid()) = user_id);
