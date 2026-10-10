import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Share, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { OptionSheet } from '@/components/sheet';
import { Button, ErrorText, Field, ListRow, Screen, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { inviteUrl } from '@/lib/invites';
import { useCreateInvite, useMembers, useUpdateProfile, useUpdateWorkspace } from '@/lib/queries';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, workspace, workspaces, setWorkspace, signOut } = useAuth();
  const { data: members } = useMembers();
  const updateProfile = useUpdateProfile();
  const updateWorkspace = useUpdateWorkspace();
  const createInvite = useCreateInvite();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [wsName, setWsName] = useState(workspace?.name ?? '');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [switching, setSwitching] = useState(false);
  const isAdmin = workspace?.role === 'owner' || workspace?.role === 'admin';

  const makeInvite = () =>
    createInvite.mutate('member', {
      onSuccess: (token) => {
        setInviteLink(inviteUrl(token));
        setCopied(false);
      },
    });

  const copy = async () => {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);
  };

  const share = async () => {
    if (!inviteLink) return;
    if (Platform.OS === 'web') return copy();
    await Share.share({ message: `Join our workspace: ${inviteLink}` });
  };

  return (
    <Screen back title="Settings">
      <View style={styles.wrap}>
        <SectionHeader title="You" />
        <View style={styles.profileRow}>
          <Avatar name={profile?.full_name ?? profile?.email} color={profile?.avatar_color} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>{profile?.full_name ?? 'No name yet'}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{profile?.email}</Text>
          </View>
        </View>
        <Field label="Your name" value={name} onChangeText={setName} autoCapitalize="words" onBlur={() => name.trim() && name.trim() !== profile?.full_name && updateProfile.mutate({ full_name: name.trim() })} />

        <SectionHeader title="Workspace" />
        <Field
          label="Workspace name"
          value={wsName}
          onChangeText={setWsName}
          editable={isAdmin}
          onBlur={() => isAdmin && wsName.trim() && wsName.trim() !== workspace?.name && updateWorkspace.mutate(wsName.trim())}
        />
        {workspaces.length > 1 ? <Button title="Switch workspace" variant="secondary" icon="people" onPress={() => setSwitching(true)} /> : null}

        <SectionHeader title="Members" count={members?.length} />
        <View>
          {(members ?? []).map((m, i) => (
            <ListRow key={m.id} last={i === (members?.length ?? 0) - 1}>
              <Avatar name={m.full_name} color={m.avatar_color} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '500' }}>
                  {m.full_name ?? m.email}
                  {m.id === profile?.id ? ' (you)' : ''}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{m.email}</Text>
              </View>
              <Text style={{ color: theme.textSecondary, fontSize: 13, textTransform: 'capitalize' }}>{m.role}</Text>
            </ListRow>
          ))}
        </View>

        {isAdmin ? (
          <View style={styles.inviteBox}>
            <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>Invite people</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18 }}>Create a link and send it to a teammate. Each link works once.</Text>
            {inviteLink ? (
              <View style={[styles.linkBox, { backgroundColor: theme.surface }]}>
                <Text selectable style={{ color: theme.text, fontSize: 13, flex: 1 }} numberOfLines={2}>
                  {inviteLink}
                </Text>
              </View>
            ) : null}
            <View style={styles.inviteButtons}>
              <Button title={inviteLink ? 'New link' : 'Create invite link'} icon="personAdd" variant={inviteLink ? 'secondary' : 'primary'} small onPress={makeInvite} loading={createInvite.isPending} />
              {inviteLink ? <Button title={copied ? 'Copied' : 'Copy'} icon="copy" variant="secondary" small onPress={copy} /> : null}
              {inviteLink && Platform.OS !== 'web' ? <Button title="Share" icon="link" variant="secondary" small onPress={share} /> : null}
            </View>
            <ErrorText>{createInvite.error?.message}</ErrorText>
          </View>
        ) : null}

        <SectionHeader title="Account" />
        <Button title="Create another workspace" variant="secondary" icon="plus" onPress={() => router.push('/onboarding')} />
        <Button title="Sign out" variant="danger" icon="logout" onPress={signOut} />
      </View>

      <OptionSheet
        visible={switching}
        title="Switch workspace"
        onClose={() => setSwitching(false)}
        options={workspaces.map((w) => ({ value: w.id, label: w.name, sublabel: w.role, selected: w.id === workspace?.id }))}
        onSelect={(id) => {
          setWorkspace(id).then(() => router.replace('/'));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three, maxWidth: 560, width: '100%', alignSelf: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inviteBox: { gap: Spacing.two, marginTop: Spacing.two },
  linkBox: { borderRadius: 10, padding: 12 },
  inviteButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
