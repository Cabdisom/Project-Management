import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { OptionSheet } from '@/components/sheet';
import { Button, Chip, IconButton, Screen } from '@/components/ui';
import { PriorityColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { addDays, formatDue, startOfDay } from '@/lib/dates';
import { parseTask, type Priority } from '@/lib/parse-task';
import { useCreateTask, useMembers, useProjects } from '@/lib/queries';

type Picker = 'due' | 'project' | 'priority' | 'assignee' | null;

export default function NewTaskScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string; statusId?: string }>();
  const { session } = useAuth();
  const { data: projects } = useProjects();
  const { data: members } = useMembers();
  const create = useCreateTask();

  const [text, setText] = useState('');
  const [picker, setPicker] = useState<Picker>(null);
  const [overrides, setOverrides] = useState<{ dueAt?: Date | null; projectId?: string | null; priority?: Priority | null; assigneeId?: string | null }>({});

  const ctx = useMemo(
    () => ({
      projects: (projects ?? []).map((p) => ({ id: p.id, name: p.name })),
      members: [
        ...(members ?? []).map((m) => ({ id: m.id, name: m.full_name ?? m.email ?? '' })),
        ...(session ? [{ id: '__me__', name: 'me' }] : []),
      ],
    }),
    [projects, members, session],
  );

  const parsed = useMemo(() => parseTask(text, ctx), [text, ctx]);

  const dueAt = overrides.dueAt !== undefined ? overrides.dueAt : parsed.dueAt;
  const projectId = overrides.projectId !== undefined ? overrides.projectId : (parsed.projectId ?? params.projectId ?? null) || null;
  const priority = overrides.priority !== undefined ? overrides.priority : parsed.priority;
  const parsedAssignee = parsed.assigneeId === '__me__' ? session?.user.id ?? null : parsed.assigneeId;
  const assigneeId = overrides.assigneeId !== undefined ? overrides.assigneeId : (parsedAssignee ?? session?.user.id ?? null);

  const project = projects?.find((p) => p.id === projectId) ?? null;
  const assignee = members?.find((m) => m.id === assigneeId) ?? null;
  const canSave = parsed.title.trim().length > 0 && !create.isPending;

  const save = () => {
    if (!canSave) return;
    create.mutate(
      {
        title: parsed.title.trim(),
        projectId,
        statusId: projectId && projectId === params.projectId ? params.statusId || null : null,
        dueAt,
        priority: priority ?? 'none',
        assigneeId,
      },
      { onSuccess: () => (router.canGoBack() ? router.back() : router.replace('/')) },
    );
  };

  const quickDates = () => {
    const today = startOfDay(new Date());
    const nextMonday = addDays(today, ((8 - today.getDay()) % 7) || 7);
    return [
      { value: 'today', label: 'Today', sublabel: formatDue(today.toISOString()) },
      { value: 'tomorrow', label: 'Tomorrow', sublabel: formatDue(addDays(today, 1).toISOString()) },
      { value: 'monday', label: 'Next Monday', sublabel: formatDue(nextMonday.toISOString()) },
      { value: 'week', label: 'In a week', sublabel: formatDue(addDays(today, 7).toISOString()) },
      { value: 'none', label: 'No due date' },
    ];
  };

  return (
    <Screen
      scroll={false}
      padded={false}
      title="New task"
      right={<IconButton name="close" label="Cancel" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}
      back={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.wrap}>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>Type naturally. Dates, #project, !priority and @person are picked up as you write.</Text>
          <TextInput
            autoFocus
            multiline
            value={text}
            onChangeText={setText}
            placeholder="Call Nile Textiles tomorrow 3pm #client !high"
            placeholderTextColor={theme.textFaint}
            style={[styles.input, { color: theme.text }]}
            accessibilityLabel="Task"
            onSubmitEditing={save}
            blurOnSubmit
          />

          <View style={styles.chips}>
            <Chip
              icon="calendar"
              label={dueAt ? formatDue(dueAt.toISOString()) : 'Due date'}
              onPress={() => setPicker('due')}
              color={dueAt ? '#92400E' : undefined}
              background={dueAt ? '#FEF3C7' : undefined}
              dashed={!dueAt}
            />
            <Chip
              label={project ? project.name : 'Project'}
              dot={project?.color}
              onPress={() => setPicker('project')}
              color={project ? '#5B21B6' : undefined}
              background={project ? '#EDE9FE' : undefined}
              dashed={!project}
            />
            <Chip
              icon="flag"
              label={priority && priority !== 'none' ? PriorityColors[priority].label : 'Priority'}
              onPress={() => setPicker('priority')}
              color={priority && priority !== 'none' ? PriorityColors[priority].color : undefined}
              background={priority && priority !== 'none' ? PriorityColors[priority].soft : undefined}
              dashed={!priority || priority === 'none'}
            />
            <Chip
              icon={assignee ? undefined : 'person'}
              label={assignee ? (assignee.id === session?.user.id ? 'Me' : (assignee.full_name ?? assignee.email ?? 'Someone')) : 'Unassigned'}
              onPress={() => setPicker('assignee')}
              dashed={!assignee}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.count, { color: theme.textFaint }]}>{parsed.title.trim() ? `"${parsed.title.trim()}"` : ''}</Text>
            <Button title="Add task" icon="send" onPress={save} disabled={!canSave} loading={create.isPending} />
          </View>
          {create.error ? <Text style={{ color: theme.danger, paddingHorizontal: Spacing.three }}>{create.error.message}</Text> : null}
        </View>
      </KeyboardAvoidingView>

      <OptionSheet
        visible={picker === 'due'}
        title="Due"
        onClose={() => setPicker(null)}
        options={quickDates()}
        onSelect={(v) => {
          const today = startOfDay(new Date());
          const map: Record<string, Date | null> = {
            today,
            tomorrow: addDays(today, 1),
            monday: addDays(today, ((8 - today.getDay()) % 7) || 7),
            week: addDays(today, 7),
            none: null,
          };
          setOverrides((o) => ({ ...o, dueAt: map[v] ?? null }));
        }}
      />
      <OptionSheet
        visible={picker === 'project'}
        title="Project"
        onClose={() => setPicker(null)}
        options={[...(projects ?? []).map((p) => ({ value: p.id, label: p.name, dot: p.color, selected: p.id === projectId })), { value: '', label: 'No project', icon: 'close' as const }]}
        onSelect={(v) => setOverrides((o) => ({ ...o, projectId: v || null }))}
      />
      <OptionSheet
        visible={picker === 'priority'}
        title="Priority"
        onClose={() => setPicker(null)}
        options={(['urgent', 'high', 'medium', 'low', 'none'] as Priority[]).map((p) => ({ value: p, label: PriorityColors[p].label, icon: 'flag' as const, color: PriorityColors[p].color, selected: (priority ?? 'none') === p }))}
        onSelect={(v) => setOverrides((o) => ({ ...o, priority: v as Priority }))}
      />
      <OptionSheet
        visible={picker === 'assignee'}
        title="Assign to"
        onClose={() => setPicker(null)}
        options={[...(members ?? []).map((m) => ({ value: m.id, label: m.id === session?.user.id ? `${m.full_name ?? 'Me'} (you)` : (m.full_name ?? m.email ?? 'Member'), dot: m.avatar_color, selected: m.id === assigneeId })), { value: '', label: 'Unassigned', icon: 'person' as const }]}
        onSelect={(v) => setOverrides((o) => ({ ...o, assigneeId: v || null }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flex: 1, padding: Spacing.three, gap: Spacing.three },
  hint: { fontSize: 13 },
  input: { fontSize: 22, lineHeight: 30, fontWeight: '500', minHeight: 90, textAlignVertical: 'top', padding: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three, paddingBottom: Spacing.three },
  count: { flex: 1, fontSize: 13 },
});
