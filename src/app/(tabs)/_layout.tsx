import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/lib/auth';
import { takePendingInvite } from '@/lib/invites';
import { acceptInvite } from '@/lib/queries';
import { useRealtimeSync } from '@/lib/realtime';

export default function TabsLayout() {
  useRealtimeSync();
  const { refresh, setWorkspace } = useAuth();

  // If the person opened an invite link before signing in, join that workspace now.
  useEffect(() => {
    takePendingInvite().then(async (token) => {
      if (!token) return;
      try {
        const wsId = await acceptInvite(token);
        await setWorkspace(wsId);
        await refresh();
      } catch {
        // Invalid or used invite. Nothing to do.
      }
    });
  }, [refresh, setWorkspace]);

  return <AppTabs />;
}
