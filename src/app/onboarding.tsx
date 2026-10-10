import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { takePendingInvite } from '@/lib/invites';
import { acceptInvite, useCreateWorkspace } from '@/lib/queries';

export default function OnboardingScreen() {
  const theme = useTheme();
  const { profile, signOut, refresh, setWorkspace } = useAuth();
  const [name, setName] = useState('');
  const [invite, setInvite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const create = useCreateWorkspace();

  const join = async (raw: string) => {
    const token = raw.trim().split('/').pop() ?? '';
    if (!token) return;
    setJoining(true);
    setError(null);
    try {
      const wsId = await acceptInvite(token);
      await setWorkspace(wsId);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That invite link does not work.');
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    takePendingInvite().then((t) => {
      if (t) join(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={[styles.hello, { color: theme.textSecondary }]}>Hi {profile?.full_name?.split(' ')[0] ?? 'there'}</Text>
        <Text style={[styles.title, { color: theme.text }]}>Set up your team</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>A workspace holds your team, projects and tasks. Create one, or join with an invite link.</Text>

        <View style={[styles.card, { borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Create a workspace</Text>
          <Field placeholder="Team or company name" value={name} onChangeText={setName} autoCapitalize="words" />
          <Button
            title="Create workspace"
            loading={create.isPending}
            disabled={!name.trim()}
            onPress={() => {
              setError(null);
              create.mutate(name.trim(), { onError: (e) => setError(e.message) });
            }}
          />
        </View>

        <View style={[styles.card, { borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Join with an invite link</Text>
          <Field placeholder="Paste the invite link or code" value={invite} onChangeText={setInvite} autoCapitalize="none" autoCorrect={false} />
          <Button title="Join workspace" variant="secondary" loading={joining} disabled={!invite.trim()} onPress={() => join(invite)} />
        </View>

        <ErrorText>{error}</ErrorText>
        <Button title="Sign out" variant="ghost" onPress={signOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three, paddingTop: Spacing.six, maxWidth: 480, width: '100%', alignSelf: 'center' },
  hello: { fontSize: 15 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.4 },
  body: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.two },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: Spacing.three, gap: Spacing.three },
  cardTitle: { fontSize: 17, fontWeight: '600' },
});
