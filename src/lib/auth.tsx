import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_color: string;
};

export type Workspace = {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  workspaces: Workspace[];
  workspace: Workspace | null;
  setWorkspace: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);
const WS_KEY = 'pm.workspace';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const loadUserData = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      setWorkspaces([]);
      setWorkspaceId(null);
      return;
    }
    const [{ data: p }, { data: m }, stored] = await Promise.all([
      supabase.from('profiles').select('id, email, full_name, avatar_color').eq('id', s.user.id).maybeSingle(),
      supabase.from('workspace_members').select('role, workspace:workspaces(id, name)').eq('user_id', s.user.id),
      AsyncStorage.getItem(WS_KEY),
    ]);
    setProfile(p ?? { id: s.user.id, email: s.user.email ?? null, full_name: null, avatar_color: '#0F766E' });
    const list: Workspace[] = (m ?? [])
      .filter((row) => row.workspace)
      .map((row) => ({ id: row.workspace!.id, name: row.workspace!.name, role: row.role }));
    setWorkspaces(list);
    const chosen = list.find((w) => w.id === stored) ?? list[0] ?? null;
    setWorkspaceId(chosen?.id ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadUserData(data.session);
      if (active) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        loadUserData(s);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadUserData]);

  const setWorkspace = useCallback(async (id: string) => {
    setWorkspaceId(id);
    await AsyncStorage.setItem(WS_KEY, id);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await loadUserData(data.session);
  }, [loadUserData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(WS_KEY);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      profile,
      workspaces,
      workspace: workspaces.find((w) => w.id === workspaceId) ?? null,
      setWorkspace,
      refresh,
      signOut,
    }),
    [loading, session, profile, workspaces, workspaceId, setWorkspace, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
