-- Taskflow schema for Supabase Auth + Supabase-hosted PostgreSQL.
-- Passwords, email uniqueness, sessions, and token expiry are managed by
-- Supabase Auth in auth.users. No application users table is required.

create extension if not exists pgcrypto;

create type public.project_status as enum ('Not Started', 'In Progress', 'Completed');
create type public.task_status as enum ('Pending', 'In Progress', 'Completed');
create type public.task_priority as enum ('Low', 'Medium', 'High');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text not null default '',
  status public.project_status not null default 'Not Started',
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  constraint projects_dates_valid check (end_date is null or end_date >= start_date)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text not null default '',
  priority public.task_priority not null default 'Medium',
  status public.task_status not null default 'Pending',
  due_date date,
  created_at timestamptz not null default now()
);

create index projects_owner_created_idx on public.projects(owner_id, created_at desc);
create index tasks_owner_created_idx on public.tasks(owner_id, created_at desc);
create index tasks_project_id_idx on public.tasks(project_id);

alter table public.projects enable row level security;
alter table public.tasks enable row level security;

create policy "Users can view their projects"
  on public.projects for select
  using (auth.uid() = owner_id);

create policy "Users can create their projects"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their projects"
  on public.projects for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their projects"
  on public.projects for delete
  using (auth.uid() = owner_id);

create policy "Users can view their tasks"
  on public.tasks for select
  using (auth.uid() = owner_id);

create policy "Users can create their tasks"
  on public.tasks for insert
  with check (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.projects
      where projects.id = tasks.project_id
        and projects.owner_id = auth.uid()
    )
  );

create policy "Users can update their tasks"
  on public.tasks for update
  using (auth.uid() = owner_id)
  with check (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.projects
      where projects.id = tasks.project_id
        and projects.owner_id = auth.uid()
    )
  );

create policy "Users can delete their tasks"
  on public.tasks for delete
  using (auth.uid() = owner_id);

-- Run this while signed in to create safe sample rows for the current
-- Supabase Auth user. It never creates or stores a password.
create or replace function public.seed_demo_data()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  demo_project_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to seed demo data';
  end if;

  insert into public.projects (
    owner_id, name, description, status, start_date, end_date
  )
  select
    auth.uid(),
    'Website refresh',
    'A focused sprint for the new marketing site.',
    'In Progress',
    current_date,
    current_date + 21
  where not exists (
    select 1 from public.projects where owner_id = auth.uid()
  );

  select id into demo_project_id
  from public.projects
  where owner_id = auth.uid()
  order by created_at
  limit 1;

  insert into public.tasks (
    owner_id, project_id, name, description, priority, status, due_date
  )
  select
    auth.uid(),
    demo_project_id,
    'Create project brief',
    'Align on scope and milestones.',
    'High',
    'Completed',
    current_date + 2
  where not exists (
    select 1 from public.tasks where owner_id = auth.uid()
  );
end;
$$;
