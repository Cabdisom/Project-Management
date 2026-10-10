import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Loading, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { storePendingInvite } from '@/lib/invites';
import { acceptInvite } from '@/lib/queries';

export default function InviteScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { loading, session, refresh, setWorkspace } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !token) return;
    if (!session) {
      storePendingInvite(token).then(() => router.replace('/sign-in'));
      return;
    }
    acceptInvite(token)
      .then(async (wsId) => {
        await setWorkspace(wsId);
        await refresh();
        router.replace('/');
      })
      .catch((e: Error) => setError(e.message));
  }, [loading, session, token, refresh, setWorkspace, router]);

  return (
    <Screen>
      {error ? (
        <View style={{ gap: Spacing.three, paddingTop: Spacing.six, alignItems: 'center' }}>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: '600' }}>This invite does not work</Text>
          <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>{error}</Text>
          <Button title="Go to the app" onPress={() => router.replace('/')} />
        </View>
      ) : (
        <Loading label="Joining workspace…" />
      )}
    </Screen>
  );
}
