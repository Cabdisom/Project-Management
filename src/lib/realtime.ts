import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/**
 * Listens for changes in the current workspace and refreshes the affected
 * queries, so other people's edits show up without a reload.
 */
export function useRealtimeSync() {
  const qc = useQueryClient();
  const { workspace, session } = useAuth();
  const ws = workspace?.id;
  const uid = session?.user.id;

  useEffect(() => {
    if (!ws || !uid) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const pending = new Set<string>();

    const flush = () => {
      timer = null;
      const tables = [...pending];
      pending.clear();
      if (tables.some((t) => t === 'tasks' || t === 'subtasks' || t === 'comments' || t === 'project_statuses')) {
        qc.invalidateQueries({ queryKey: ['my-tasks'] });
        qc.invalidateQueries({ queryKey: ['project'] });
        qc.invalidateQueries({ queryKey: ['task'] });
        qc.invalidateQueries({ queryKey: ['projects'] });
        qc.invalidateQueries({ queryKey: ['search'] });
      }
      if (tables.includes('projects')) {
        qc.invalidateQueries({ queryKey: ['projects'] });
        qc.invalidateQueries({ queryKey: ['project'] });
      }
      if (tables.includes('notifications')) qc.invalidateQueries({ queryKey: ['inbox'] });
    };

    const schedule = (table: string) => {
      pending.add(table);
      if (!timer) timer = setTimeout(flush, 400);
    };

    const channel = supabase
      .channel(`ws-${ws}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${ws}` }, () => schedule('tasks'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks', filter: `workspace_id=eq.${ws}` }, () => schedule('subtasks'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `workspace_id=eq.${ws}` }, () => schedule('comments'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `workspace_id=eq.${ws}` }, () => schedule('projects'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_statuses', filter: `workspace_id=eq.${ws}` }, () => schedule('project_statuses'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, () => schedule('notifications'))
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [qc, ws, uid]);
}
