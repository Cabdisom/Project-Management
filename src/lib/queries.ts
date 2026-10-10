import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useNow } from '@/hooks/use-now';
import { useAuth } from '@/lib/auth';
import type { Enums, Tables, TablesUpdate } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Priority = Enums<'task_priority'>;
export type ProfileLite = { id: string; full_name: string | null; avatar_color: string; email?: string | null };
export type ProjectLite = { id: string; name: string; color: string };
export type StatusLite = { id: string; name: string; color: string; is_done: boolean; position?: number };

export type TaskListItem = Tables<'tasks'> & {
  project: ProjectLite | null;
  status: StatusLite | null;
  assignee: ProfileLite | null;
};

export type ProjectWithCounts = Tables<'projects'> & { total: number; done: number; people: ProfileLite[] };

export type NotificationItem = Tables<'notifications'> & {
  actor: ProfileLite | null;
  task: { id: string; title: string; project: ProjectLite | null } | null;
};

export type TaskDetail = TaskListItem & {
  creator: ProfileLite | null;
  subtasks: Tables<'subtasks'>[];
  comments: (Tables<'comments'> & { author: ProfileLite | null })[];
  activity: (Tables<'activity'> & { actor: ProfileLite | null })[];
  labels: Tables<'labels'>[];
};

const TASK_SELECT =
  '*, project:projects(id, name, color), status:project_statuses(id, name, color, is_done, position), assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_color)';

export const keys = {
  myTasks: (ws: string, uid: string) => ['my-tasks', ws, uid] as const,
  inbox: (uid: string) => ['inbox', uid] as const,
  projects: (ws: string) => ['projects', ws] as const,
  project: (id: string) => ['project', id] as const,
  task: (id: string) => ['task', id] as const,
  members: (ws: string) => ['members', ws] as const,
  search: (ws: string, q: string) => ['search', ws, q] as const,
};

function useIds() {
  const { workspace, session } = useAuth();
  return { ws: workspace?.id ?? '', uid: session?.user.id ?? '' };
}

/* ---------- Reads ---------- */

export function useMyTasks() {
  const { ws, uid } = useIds();
  return useQuery({
    queryKey: keys.myTasks(ws, uid),
    enabled: !!ws && !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(TASK_SELECT)
        .eq('workspace_id', ws)
        .eq('assignee_id', uid)
        .is('completed_at', null)
        .order('due_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as unknown as TaskListItem[];
    },
  });
}

export function useInbox() {
  const { uid } = useIds();
  return useQuery({
    queryKey: keys.inbox(uid),
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, actor:profiles!notifications_actor_id_fkey(id, full_name, avatar_color), task:tasks(id, title, project:projects(id, name, color))')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as unknown as NotificationItem[];
    },
  });
}

export function useUnreadCount() {
  const { data } = useInbox();
  const now = useNow();
  return (data ?? []).filter((n) => !n.read_at && (!n.snoozed_until || new Date(n.snoozed_until).getTime() <= now)).length;
}

export function useProjects() {
  const { ws } = useIds();
  return useQuery({
    queryKey: keys.projects(ws),
    enabled: !!ws,
    queryFn: async () => {
      const [{ data: projects, error }, { data: tasks, error: e2 }] = await Promise.all([
        supabase.from('projects').select('*').eq('workspace_id', ws).is('archived_at', null).order('position').order('created_at'),
        supabase
          .from('tasks')
          .select('project_id, completed_at, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_color)')
          .eq('workspace_id', ws)
          .not('project_id', 'is', null),
      ]);
      if (error) throw error;
      if (e2) throw e2;
      return (projects ?? []).map((p): ProjectWithCounts => {
        const mine = (tasks ?? []).filter((t) => t.project_id === p.id);
        const people = new Map<string, ProfileLite>();
        for (const t of mine) {
          const a = t.assignee as unknown as ProfileLite | null;
          if (a) people.set(a.id, a);
        }
        return { ...p, total: mine.length, done: mine.filter((t) => t.completed_at).length, people: [...people.values()] };
      });
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: keys.project(id),
    enabled: !!id,
    queryFn: async () => {
      const [{ data: project, error }, { data: statuses, error: e2 }, { data: tasks, error: e3 }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_statuses').select('*').eq('project_id', id).order('position'),
        supabase.from('tasks').select(TASK_SELECT).eq('project_id', id).order('position').order('created_at'),
      ]);
      if (error) throw error;
      if (e2) throw e2;
      if (e3) throw e3;
      return { project, statuses: statuses ?? [], tasks: (tasks ?? []) as unknown as TaskListItem[] };
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: keys.task(id),
    enabled: !!id,
    queryFn: async () => {
      const [{ data: task, error }, { data: subtasks }, { data: comments }, { data: activity }, { data: labels }] = await Promise.all([
        supabase.from('tasks').select(`${TASK_SELECT}, creator:profiles!tasks_created_by_fkey(id, full_name, avatar_color)`).eq('id', id).single(),
        supabase.from('subtasks').select('*').eq('task_id', id).order('position').order('created_at'),
        supabase.from('comments').select('*, author:profiles(id, full_name, avatar_color)').eq('task_id', id).order('created_at'),
        supabase.from('activity').select('*, actor:profiles(id, full_name, avatar_color)').eq('task_id', id).order('created_at', { ascending: false }).limit(30),
        supabase.from('task_labels').select('label:labels(*)').eq('task_id', id),
      ]);
      if (error) throw error;
      return {
        ...(task as unknown as TaskListItem & { creator: ProfileLite | null }),
        subtasks: subtasks ?? [],
        comments: (comments ?? []) as unknown as TaskDetail['comments'],
        activity: (activity ?? []) as unknown as TaskDetail['activity'],
        labels: (labels ?? []).map((l) => l.label).filter(Boolean) as unknown as Tables<'labels'>[],
      } as TaskDetail;
    },
  });
}

export function useMembers() {
  const { ws } = useIds();
  return useQuery({
    queryKey: keys.members(ws),
    enabled: !!ws,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('role, created_at, profile:profiles(id, full_name, avatar_color, email)')
        .eq('workspace_id', ws)
        .order('created_at');
      if (error) throw error;
      return (data ?? [])
        .filter((m) => m.profile)
        .map((m) => ({ role: m.role, ...(m.profile as unknown as ProfileLite) }));
    },
  });
}

export function useSearch(q: string) {
  const { ws } = useIds();
  const term = q.trim();
  return useQuery({
    queryKey: keys.search(ws, term),
    enabled: !!ws && term.length >= 2,
    queryFn: async () => {
      const like = `%${term.replace(/[%_]/g, '')}%`;
      const [{ data: tasks }, { data: projects }] = await Promise.all([
        supabase.from('tasks').select(TASK_SELECT).eq('workspace_id', ws).ilike('title', like).order('completed_at', { nullsFirst: true }).limit(30),
        supabase.from('projects').select('*').eq('workspace_id', ws).ilike('name', like).limit(10),
      ]);
      return { tasks: (tasks ?? []) as unknown as TaskListItem[], projects: projects ?? [] };
    },
  });
}

/* ---------- Writes ---------- */

function useInvalidate() {
  const qc = useQueryClient();
  const { ws, uid } = useIds();
  return {
    tasks: (projectId?: string | null, taskId?: string) => {
      qc.invalidateQueries({ queryKey: keys.myTasks(ws, uid) });
      qc.invalidateQueries({ queryKey: keys.projects(ws) });
      if (projectId) qc.invalidateQueries({ queryKey: keys.project(projectId) });
      if (taskId) qc.invalidateQueries({ queryKey: keys.task(taskId) });
      qc.invalidateQueries({ queryKey: ['search'] });
    },
    inbox: () => qc.invalidateQueries({ queryKey: keys.inbox(uid) }),
    projects: () => qc.invalidateQueries({ queryKey: keys.projects(ws) }),
    members: () => qc.invalidateQueries({ queryKey: keys.members(ws) }),
  };
}

export type NewTask = {
  title: string;
  description?: string | null;
  projectId?: string | null;
  statusId?: string | null;
  dueAt?: Date | null;
  priority?: Priority | null;
  assigneeId?: string | null;
};

export function useCreateTask() {
  const { ws, uid } = useIds();
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async (input: NewTask) => {
      let statusId = input.statusId ?? null;
      if (input.projectId && !statusId) {
        const { data } = await supabase.from('project_statuses').select('id').eq('project_id', input.projectId).order('position').limit(1).maybeSingle();
        statusId = data?.id ?? null;
      }
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          workspace_id: ws,
          title: input.title,
          description: input.description ?? null,
          project_id: input.projectId ?? null,
          status_id: statusId,
          due_at: input.dueAt ? input.dueAt.toISOString() : null,
          priority: input.priority ?? 'none',
          assignee_id: input.assigneeId === undefined ? uid : input.assigneeId,
          created_by: uid,
          position: Date.now(),
        })
        .select('id, project_id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => inv.tasks(data.project_id),
  });
}

export function useUpdateTask() {
  const inv = useInvalidate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<'tasks'> }) => {
      const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select('id, project_id').single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: keys.task(id) });
      const prev = qc.getQueryData<TaskDetail>(keys.task(id));
      if (prev) qc.setQueryData<TaskDetail>(keys.task(id), { ...prev, ...patch } as TaskDetail);
      return { prev };
    },
    onError: (_e, { id }, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.task(id), ctx.prev);
    },
    onSettled: (data, _e, { id }) => inv.tasks(data?.project_id, id),
  });
}

/** Complete or reopen a task. Also moves it to the project's done status (or first open status). */
export function useToggleTask() {
  const { ws, uid } = useIds();
  const inv = useInvalidate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ task, completed }: { task: Pick<TaskListItem, 'id' | 'project_id'>; completed: boolean }) => {
      let statusId: string | null | undefined;
      if (task.project_id) {
        const { data } = await supabase.from('project_statuses').select('id, is_done, position').eq('project_id', task.project_id).order('position');
        const target = completed ? data?.find((s) => s.is_done) : data?.find((s) => !s.is_done);
        statusId = target?.id;
      }
      const patch: TablesUpdate<'tasks'> = { completed_at: completed ? new Date().toISOString() : null };
      if (statusId) patch.status_id = statusId;
      const { error } = await supabase.from('tasks').update(patch).eq('id', task.id);
      if (error) throw error;
      return task;
    },
    onMutate: async ({ task, completed }) => {
      const key = keys.myTasks(ws, uid);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<TaskListItem[]>(key);
      if (prev && completed) qc.setQueryData<TaskListItem[]>(key, prev.filter((t) => t.id !== task.id));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.myTasks(ws, uid), ctx.prev);
    },
    onSettled: (task) => inv.tasks(task?.project_id, task?.id),
  });
}

export function useDeleteTask() {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async (task: Pick<TaskListItem, 'id' | 'project_id'>) => {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) throw error;
      return task;
    },
    onSuccess: (task) => inv.tasks(task.project_id),
  });
}

export function useAddComment() {
  const { ws, uid } = useIds();
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async ({ taskId, body }: { taskId: string; body: string }) => {
      const { error } = await supabase.from('comments').insert({ task_id: taskId, workspace_id: ws, author_id: uid, body });
      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => inv.tasks(null, taskId),
  });
}

export function useSubtasks(taskId: string) {
  const { ws } = useIds();
  const inv = useInvalidate();
  const qc = useQueryClient();
  const add = useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from('subtasks').insert({ task_id: taskId, workspace_id: ws, title, position: Date.now() });
      if (error) throw error;
    },
    onSuccess: () => inv.tasks(null, taskId),
  });
  const toggle = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from('subtasks').update({ is_done: done }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, done }) => {
      await qc.cancelQueries({ queryKey: keys.task(taskId) });
      const prev = qc.getQueryData<TaskDetail>(keys.task(taskId));
      if (prev) qc.setQueryData<TaskDetail>(keys.task(taskId), { ...prev, subtasks: prev.subtasks.map((s) => (s.id === id ? { ...s, is_done: done } : s)) });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.task(taskId), ctx.prev);
    },
    onSettled: () => inv.tasks(null, taskId),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subtasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => inv.tasks(null, taskId),
  });
  return { add, toggle, remove };
}

export function useNotificationActions() {
  const { uid } = useIds();
  const inv = useInvalidate();
  const qc = useQueryClient();
  const patchLocal = (id: string | null, patch: Partial<Tables<'notifications'>>) => {
    const prev = qc.getQueryData<NotificationItem[]>(keys.inbox(uid));
    if (prev) qc.setQueryData<NotificationItem[]>(keys.inbox(uid), prev.map((n) => (id === null || n.id === id ? { ...n, ...patch } : n)));
  };
  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => patchLocal(id, { read_at: new Date().toISOString() }),
    onSettled: () => inv.inbox(),
  });
  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', uid).is('read_at', null);
      if (error) throw error;
    },
    onMutate: () => patchLocal(null, { read_at: new Date().toISOString() }),
    onSettled: () => inv.inbox(),
  });
  const snooze = useMutation({
    mutationFn: async ({ id, until }: { id: string; until: Date }) => {
      const { error } = await supabase.from('notifications').update({ snoozed_until: until.toISOString(), read_at: null }).eq('id', id);
      if (error) throw error;
    },
    onMutate: ({ id, until }) => patchLocal(id, { snoozed_until: until.toISOString(), read_at: null }),
    onSettled: () => inv.inbox(),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => {
      const prev = qc.getQueryData<NotificationItem[]>(keys.inbox(uid));
      if (prev) qc.setQueryData<NotificationItem[]>(keys.inbox(uid), prev.filter((n) => n.id !== id));
    },
    onSettled: () => inv.inbox(),
  });
  return { markRead, markAllRead, snooze, remove };
}

export function useCreateProject() {
  const { ws, uid } = useIds();
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async (input: { name: string; color: string; dueDate?: string | null; description?: string | null }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ workspace_id: ws, name: input.name, color: input.color, due_date: input.dueDate ?? null, description: input.description ?? null, created_by: uid, position: Date.now() })
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => inv.projects(),
  });
}

export function useUpdateProject() {
  const inv = useInvalidate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<'projects'> }) => {
      const { error } = await supabase.from('projects').update(patch).eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      inv.projects();
      qc.invalidateQueries({ queryKey: keys.project(id) });
    },
  });
}

export function useCreateWorkspace() {
  const { uid } = useIds();
  const { refresh, setWorkspace } = useAuth();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('workspaces').insert({ name, created_by: uid }).select('id').single();
      if (error) throw error;
      await setWorkspace(data.id);
      await refresh();
      return data.id;
    },
  });
}

export function useCreateInvite() {
  const { ws, uid } = useIds();
  return useMutation({
    mutationFn: async (role: Enums<'member_role'> = 'member') => {
      const { data, error } = await supabase.from('invites').insert({ workspace_id: ws, role, created_by: uid }).select('token').single();
      if (error) throw error;
      return data.token;
    },
  });
}

export async function acceptInvite(token: string): Promise<string> {
  const { data, error } = await supabase.rpc('accept_invite', { invite_token: token });
  if (error) throw error;
  return data;
}

export function useUpdateProfile() {
  const { uid } = useIds();
  const { refresh } = useAuth();
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async (patch: { full_name?: string; avatar_color?: string }) => {
      const { error } = await supabase.from('profiles').update(patch).eq('id', uid);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      inv.members();
    },
  });
}

export function useUpdateWorkspace() {
  const { ws } = useIds();
  const { refresh } = useAuth();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('workspaces').update({ name }).eq('id', ws);
      if (error) throw error;
    },
    onSuccess: () => refresh(),
  });
}
