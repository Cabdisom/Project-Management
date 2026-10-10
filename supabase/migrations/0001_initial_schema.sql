-- Project management app: initial schema
create extension if not exists pgcrypto;

-- Enums
create type public.member_role as enum ('owner', 'admin', 'member', 'guest');
create type public.task_priority as enum ('urgent', 'high', 'medium', 'low', 'none');

-- Profiles (one per auth user)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_color text not null default '#0F766E',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  colors text[] := array['#0F766E','#1D4ED8','#7C3AED','#BE185D','#C2410C','#15803D'];
begin
  insert into public.profiles (id, email, full_name, avatar_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    colors[1 + floor(random() * array_length(colors, 1))::int]
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Workspaces and membership
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text,
  role public.member_role not null default 'member',
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_by uuid references public.profiles(id),
  accepted_by uuid references public.profiles(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#1D4ED8',
  description text,
  due_date date,
  position double precision not null default 0,
  archived_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.project_statuses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#6B7280',
  position int not null default 0,
  is_done boolean not null default false
);

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#6B7280'
);

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  status_id uuid references public.project_statuses(id) on delete set null,
  title text not null,
  description text,
  assignee_id uuid references public.profiles(id) on delete set null,
  priority public.task_priority not null default 'none',
  due_at timestamptz,
  position double precision not null default 0,
  completed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_labels (
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

create table public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  name text not null,
  storage_path text not null,
  size_bytes bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create table public.activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  task_id uuid references public.tasks(id) on delete cascade,
  kind text not null,
  body text not null,
  read_at timestamptz,
  snoozed_until timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index on public.workspace_members (user_id);
create index on public.projects (workspace_id);
create index on public.project_statuses (project_id, position);
create index on public.tasks (workspace_id);
create index on public.tasks (project_id, status_id, position);
create index on public.tasks (assignee_id, due_at);
create index on public.subtasks (task_id, position);
create index on public.comments (task_id, created_at);
create index on public.activity (task_id, created_at);
create index on public.notifications (user_id, read_at, created_at);

-- Helpers
create or replace function public.is_member(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_admin(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid() and m.role in ('owner', 'admin')
  );
$$;

-- Creator becomes owner of a new workspace
create or replace function public.handle_new_workspace()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, coalesce(new.created_by, auth.uid()), 'owner');
  return new;
end $$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- Default statuses for a new project
create or replace function public.handle_new_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.project_statuses (project_id, workspace_id, name, color, position, is_done) values
    (new.id, new.workspace_id, 'To do', '#6B7280', 0, false),
    (new.id, new.workspace_id, 'In progress', '#1D4ED8', 1, false),
    (new.id, new.workspace_id, 'Review', '#A16207', 2, false),
    (new.id, new.workspace_id, 'Done', '#15803D', 3, true);
  return new;
end $$;

create trigger on_project_created
  after insert on public.projects
  for each row execute function public.handle_new_project();

-- updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Activity and notifications on task changes
create or replace function public.handle_task_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor uuid := auth.uid();
  actor_name text;
begin
  select coalesce(full_name, email, 'Someone') into actor_name from public.profiles where id = actor;

  if tg_op = 'INSERT' then
    insert into public.activity (workspace_id, task_id, actor_id, kind, data)
    values (new.workspace_id, new.id, actor, 'created', jsonb_build_object('title', new.title));
    if new.assignee_id is not null and new.assignee_id <> coalesce(actor, '00000000-0000-0000-0000-000000000000'::uuid) then
      insert into public.notifications (workspace_id, user_id, actor_id, task_id, kind, body)
      values (new.workspace_id, new.assignee_id, actor, new.id, 'assigned', actor_name || ' assigned you ' || new.title);
    end if;
    return new;
  end if;

  if new.assignee_id is distinct from old.assignee_id then
    insert into public.activity (workspace_id, task_id, actor_id, kind, data)
    values (new.workspace_id, new.id, actor, 'assigned', jsonb_build_object('from', old.assignee_id, 'to', new.assignee_id));
    if new.assignee_id is not null and new.assignee_id <> coalesce(actor, '00000000-0000-0000-0000-000000000000'::uuid) then
      insert into public.notifications (workspace_id, user_id, actor_id, task_id, kind, body)
      values (new.workspace_id, new.assignee_id, actor, new.id, 'assigned', actor_name || ' assigned you ' || new.title);
    end if;
  end if;

  if new.status_id is distinct from old.status_id then
    insert into public.activity (workspace_id, task_id, actor_id, kind, data)
    values (new.workspace_id, new.id, actor, 'status', jsonb_build_object('from', old.status_id, 'to', new.status_id));
  end if;

  if new.completed_at is distinct from old.completed_at then
    insert into public.activity (workspace_id, task_id, actor_id, kind, data)
    values (new.workspace_id, new.id, actor, case when new.completed_at is null then 'reopened' else 'completed' end, '{}'::jsonb);
  end if;

  if new.due_at is distinct from old.due_at then
    insert into public.activity (workspace_id, task_id, actor_id, kind, data)
    values (new.workspace_id, new.id, actor, 'due', jsonb_build_object('from', old.due_at, 'to', new.due_at));
  end if;

  return new;
end $$;

create trigger on_task_change
  after insert or update on public.tasks
  for each row execute function public.handle_task_change();

-- Notify the task assignee (and creator) about new comments
create or replace function public.handle_new_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  t record;
  actor_name text;
begin
  select * into t from public.tasks where id = new.task_id;
  select coalesce(full_name, email, 'Someone') into actor_name from public.profiles where id = new.author_id;

  insert into public.activity (workspace_id, task_id, actor_id, kind, data)
  values (new.workspace_id, new.task_id, new.author_id, 'commented', jsonb_build_object('comment_id', new.id));

  if t.assignee_id is not null and t.assignee_id <> new.author_id then
    insert into public.notifications (workspace_id, user_id, actor_id, task_id, kind, body)
    values (new.workspace_id, t.assignee_id, new.author_id, new.task_id, 'comment', actor_name || ' commented on ' || t.title || ': ' || left(new.body, 120));
  end if;
  if t.created_by is not null and t.created_by <> new.author_id and t.created_by is distinct from t.assignee_id then
    insert into public.notifications (workspace_id, user_id, actor_id, task_id, kind, body)
    values (new.workspace_id, t.created_by, new.author_id, new.task_id, 'comment', actor_name || ' commented on ' || t.title || ': ' || left(new.body, 120));
  end if;
  return new;
end $$;

create trigger on_comment_created
  after insert on public.comments
  for each row execute function public.handle_new_comment();

-- Accept an invite by token
create or replace function public.accept_invite(invite_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  inv record;
begin
  select * into inv from public.invites where token = invite_token and accepted_at is null;
  if inv is null then
    raise exception 'Invite not found or already used';
  end if;
  insert into public.workspace_members (workspace_id, user_id, role)
  values (inv.workspace_id, auth.uid(), inv.role)
  on conflict (workspace_id, user_id) do nothing;
  update public.invites set accepted_at = now(), accepted_by = auth.uid() where id = inv.id;
  return inv.workspace_id;
end $$;

-- Row level security
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.invites enable row level security;
alter table public.projects enable row level security;
alter table public.project_statuses enable row level security;
alter table public.labels enable row level security;
alter table public.tasks enable row level security;
alter table public.task_labels enable row level security;
alter table public.subtasks enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.activity enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_select" on public.profiles for select to authenticated using (
  id = auth.uid() or exists (
    select 1 from public.workspace_members a
    join public.workspace_members b on a.workspace_id = b.workspace_id
    where a.user_id = auth.uid() and b.user_id = profiles.id
  )
);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "workspaces_select" on public.workspaces for select to authenticated using (public.is_member(id));
create policy "workspaces_insert" on public.workspaces for insert to authenticated with check (created_by = auth.uid());
create policy "workspaces_update" on public.workspaces for update to authenticated using (public.is_admin(id));
create policy "workspaces_delete" on public.workspaces for delete to authenticated using (
  exists (select 1 from public.workspace_members m where m.workspace_id = id and m.user_id = auth.uid() and m.role = 'owner')
);

create policy "members_select" on public.workspace_members for select to authenticated using (public.is_member(workspace_id));
create policy "members_insert_admin" on public.workspace_members for insert to authenticated with check (public.is_admin(workspace_id));
create policy "members_update_admin" on public.workspace_members for update to authenticated using (public.is_admin(workspace_id));
create policy "members_delete" on public.workspace_members for delete to authenticated using (public.is_admin(workspace_id) or user_id = auth.uid());

create policy "invites_select" on public.invites for select to authenticated using (public.is_member(workspace_id));
create policy "invites_insert" on public.invites for insert to authenticated with check (public.is_admin(workspace_id) and created_by = auth.uid());
create policy "invites_delete" on public.invites for delete to authenticated using (public.is_admin(workspace_id));

create policy "projects_all" on public.projects for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "statuses_all" on public.project_statuses for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "labels_all" on public.labels for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "tasks_all" on public.tasks for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "task_labels_all" on public.task_labels for all to authenticated using (
  exists (select 1 from public.tasks t where t.id = task_id and public.is_member(t.workspace_id))
) with check (
  exists (select 1 from public.tasks t where t.id = task_id and public.is_member(t.workspace_id))
);
create policy "subtasks_all" on public.subtasks for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "comments_select" on public.comments for select to authenticated using (public.is_member(workspace_id));
create policy "comments_insert" on public.comments for insert to authenticated with check (public.is_member(workspace_id) and author_id = auth.uid());
create policy "comments_update_own" on public.comments for update to authenticated using (author_id = auth.uid());
create policy "comments_delete" on public.comments for delete to authenticated using (author_id = auth.uid() or public.is_admin(workspace_id));
create policy "attachments_all" on public.attachments for all to authenticated using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "activity_select" on public.activity for select to authenticated using (public.is_member(workspace_id));
create policy "notifications_select_own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications_insert_member" on public.notifications for insert to authenticated with check (public.is_member(workspace_id));
create policy "notifications_update_own" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_delete_own" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- Realtime
alter publication supabase_realtime add table public.tasks, public.subtasks, public.comments, public.notifications, public.projects, public.project_statuses;
