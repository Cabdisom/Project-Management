import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { Checkbox } from '@/components/motion';
import { OptionSheet } from '@/components/sheet';
import { Chip, Empty, IconButton, Loading, ProgressBar, Screen } from '@/components/ui';
import { PriorityColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { addDays, formatDue, formatRelative, isOverdue, startOfDay } from '@/lib/dates';
import { useAddComment, useDeleteTask, useMembers, useProject, useSubtasks, useTask, useToggleTask, useUpdateTask, type Priority } from '@/lib/queries';

type Picker = 'status' | 'priority' | 'assignee' | 'due' | 'more' | null;

export default function TaskScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { data: task, isLoading, error } = useTask(id);
  const { data: projectData } = useProject(task?.project_id ?? '');
  const { data: members } = useMembers();
  const update = useUpdateTask();
  const toggle = useToggleTask();
  const del = useDeleteTask();
  const addComment = useAddComment();
  const subtasks = useSubtasks(id);

  const [picker, setPicker] = useState<Picker>(null);
  // Local edits are keyed by task id so a different task never shows stale text.
  const [edits, setEdits] = useState<{ id: string; title?: string; description?: string }>({ id: '' });
  const [newSubtask, setNewSubtask] = useState('');
  const [comment, setComment] = useState('');
  const title = edits.id === task?.id && edits.title !== undefined ? edits.title : (task?.title ?? '');
  const description = edits.id === task?.id && edits.description !== undefined ? edits.description : (task?.description ?? '');
  const setTitle = (v: string) => setEdits((e) => ({ ...(e.id === task?.id ? e : { id: task?.id ?? '' }), title: v }));
  const setDescription = (v: string) => setEdits((e) => ({ ...(e.id === task?.id ? e : { id: task?.id ?? '' }), description: v }));

  if (isLoading) {
    return (
      <Screen back>
        <Loading />
      </Screen>
    );
  }
  if (error || !task) {
    return (
      <Screen back>
        <Empty title="Task not found" body="It may have been deleted, or you no longer have access." />
      </Screen>
    );
  }

  const done = !!task.completed_at;
  const overdue = !done && isOverdue(task.due_at);
  const pr = PriorityColors[task.priority];
  const statuses = projectData?.statuses ?? [];
  const doneCount = task.subtasks.filter((s) => s.is_done).length;

  const saveTitle = () => {
    const t = title.trim();
    if (t && t !== task.title) update.mutate({ id: task.id, patch: { title: t } });
    setEdits((e) => ({ ...e, title: undefined }));
  };
  const saveDescription = () => {
    const d = description.trim();
    if (d !== (task.description ?? '')) update.mutate({ id: task.id, patch: { description: d || null } });
    setEdits((e) => ({ ...e, description: undefined }));
  };

  const quickDates = () => {
    const today = startOfDay(new Date());
    return [
      { value: 'today', label: 'Today' },
      { value: 'tomorrow', label: 'Tomorrow', sublabel: formatDue(addDays(today, 1).toISOString()) },
      { value: 'monday', label: 'Next Monday', sublabel: formatDue(addDays(today, ((8 - today.getDay()) % 7) || 7).toISOString()) },
      { value: 'week', label: 'In a week', sublabel: formatDue(addDays(today, 7).toISOString()) },
      { value: 'none', label: 'Remove due date', icon: 'close' as const },
    ];
  };

  return (
    <Screen
      back
      padded={false}
      title={task.project?.name ?? 'Task'}
      right={<IconButton name="more" label="More options" onPress={() => setPicker('more')} />}
      footer={
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.composer, { borderTopColor: theme.border, backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.two }]}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Write a comment…"
              placeholderTextColor={theme.textFaint}
              style={[styles.composerInput, { backgroundColor: theme.surface, color: theme.text }]}
              multiline
              accessibilityLabel="Comment"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send comment"
              disabled={!comment.trim() || addComment.isPending}
              onPress={() => addComment.mutate({ taskId: task.id, body: comment.trim() }, { onSuccess: () => setComment('') })}
              style={[styles.sendButton, { backgroundColor: theme.accent, opacity: comment.trim() ? 1 : 0.4 }]}>
              <Icon name="send" size={20} color={theme.onAccent} weight="bold" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      }>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.check}>
            <Checkbox checked={done} size={28} delay={150} onChange={(next) => toggle.mutate({ task, completed: next })} />
          </View>
          <TextInput
            value={title}
            onChangeText={setTitle}
            onBlur={saveTitle}
            onSubmitEditing={saveTitle}
            multiline
            blurOnSubmit
            style={[styles.title, { color: done ? theme.textFaint : theme.text, textDecorationLine: done ? 'line-through' : 'none' }]}
            accessibilityLabel="Task title"
          />
        </View>

        <View style={styles.chips}>
          {task.status ? (
            <Chip label={task.status.name} dot={task.status.color} color={task.status.color} background={`${task.status.color}1F`} icon="down" onPress={() => setPicker('status')} />
          ) : null}
          <Chip
            icon="flag"
            label={task.priority === 'none' ? 'Priority' : pr.label}
            color={task.priority === 'none' ? undefined : pr.color}
            background={task.priority === 'none' ? undefined : pr.soft}
            dashed={task.priority === 'none'}
            onPress={() => setPicker('priority')}
          />
        </View>

        <View style={[styles.fields, { borderTopColor: theme.border }]}>
          <FieldRow label="Assignee" onPress={() => setPicker('assignee')}>
            {task.assignee ? (
              <View style={styles.inline}>
                <Avatar name={task.assignee.full_name} color={task.assignee.avatar_color} size={24} />
                <Text style={[styles.value, { color: theme.text }]}>{task.assignee.id === session?.user.id ? `${task.assignee.full_name ?? 'Me'} (you)` : task.assignee.full_name}</Text>
              </View>
            ) : (
              <Text style={[styles.value, { color: theme.textFaint }]}>Unassigned</Text>
            )}
          </FieldRow>
          <FieldRow label="Due" onPress={() => setPicker('due')}>
            <Text style={[styles.value, { color: task.due_at ? (overdue ? theme.danger : theme.text) : theme.textFaint, fontWeight: overdue ? '600' : '500' }]}>{formatDue(task.due_at)}</Text>
          </FieldRow>
          {task.labels.length > 0 ? (
            <FieldRow label="Labels">
              <View style={styles.inline}>
                {task.labels.map((l) => (
                  <Chip key={l.id} label={l.name} color={l.color} background={`${l.color}1F`} />
                ))}
              </View>
            </FieldRow>
          ) : null}
          <FieldRow label="Created">
            <Text style={[styles.valueMuted, { color: theme.textSecondary }]}>
              {task.creator?.full_name ? `by ${task.creator.full_name} · ` : ''}
              {formatRelative(task.created_at)}
            </Text>
          </FieldRow>
        </View>

        <TextInput
          value={description}
          onChangeText={setDescription}
          onBlur={saveDescription}
          placeholder="Add a description…"
          placeholderTextColor={theme.textFaint}
          multiline
          style={[styles.description, { color: theme.text }]}
          accessibilityLabel="Description"
        />

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Subtasks {task.subtasks.length > 0 ? <Text style={{ color: theme.textSecondary, fontWeight: '500' }}>{doneCount} of {task.subtasks.length}</Text> : null}
            </Text>
            {task.subtasks.length > 0 ? (
              <View style={{ width: 120 }}>
                <ProgressBar value={doneCount / task.subtasks.length} color={theme.accent} height={5} />
              </View>
            ) : null}
          </View>
          {task.subtasks.map((s) => (
            <Animated.View key={s.id} entering={FadeInDown.duration(200)} layout={LinearTransition.duration(200)} style={styles.subtask}>
              <Checkbox checked={s.is_done} size={20} delay={0} label={s.title} onChange={(next) => subtasks.toggle.mutate({ id: s.id, done: next })} />
              <Text style={[styles.subText, { color: s.is_done ? theme.textFaint : theme.text, textDecorationLine: s.is_done ? 'line-through' : 'none' }]}>{s.title}</Text>
              <IconButton name="close" label="Remove subtask" size={16} color={theme.textFaint} onPress={() => subtasks.remove.mutate(s.id)} style={styles.subRemove} />
            </Animated.View>
          ))}
          <View style={styles.subtask}>
            <Icon name="plus" size={18} color={theme.textFaint} style={{ marginHorizontal: 1 }} />
            <TextInput
              value={newSubtask}
              onChangeText={setNewSubtask}
              placeholder="Add a subtask"
              placeholderTextColor={theme.textFaint}
              style={[styles.subInput, { color: theme.text }]}
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={() => {
                const t = newSubtask.trim();
                if (!t) return;
                subtasks.add.mutate(t, { onSuccess: () => setNewSubtask('') });
              }}
              accessibilityLabel="New subtask"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Comments {task.comments.length > 0 ? <Text style={{ color: theme.textSecondary, fontWeight: '500' }}>{task.comments.length}</Text> : null}
          </Text>
          {task.comments.length === 0 ? <Text style={{ color: theme.textFaint, fontSize: 14 }}>No comments yet.</Text> : null}
          {task.comments.map((c) => (
            <Animated.View key={c.id} entering={FadeInDown.duration(220)} layout={LinearTransition.duration(200)} style={styles.comment}>
              <Avatar name={c.author?.full_name} color={c.author?.avatar_color} size={30} />
              <View style={styles.commentBody}>
                <Text style={{ fontSize: 13, color: theme.text }}>
                  <Text style={{ fontWeight: '600' }}>{c.author?.full_name ?? 'Someone'}</Text>
                  <Text style={{ color: theme.textSecondary }}> · {formatRelative(c.created_at)}</Text>
                </Text>
                <Text style={{ fontSize: 15, lineHeight: 21, color: theme.text }}>{c.body}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {task.activity.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
            {task.activity.map((a) => (
              <Text key={a.id} style={{ fontSize: 13, color: theme.textSecondary }}>
                {a.actor?.full_name ?? 'Someone'} {describeActivity(a.kind)} · {formatRelative(a.created_at)}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <OptionSheet
        visible={picker === 'status'}
        title="Status"
        onClose={() => setPicker(null)}
        options={statuses.map((s) => ({ value: s.id, label: s.name, dot: s.color, selected: s.id === task.status_id }))}
        onSelect={(statusId) => {
          const s = statuses.find((x) => x.id === statusId);
          update.mutate({ id: task.id, patch: { status_id: statusId, completed_at: s?.is_done ? (task.completed_at ?? new Date().toISOString()) : null } });
        }}
      />
      <OptionSheet
        visible={picker === 'priority'}
        title="Priority"
        onClose={() => setPicker(null)}
        options={(['urgent', 'high', 'medium', 'low', 'none'] as Priority[]).map((p) => ({ value: p, label: PriorityColors[p].label, icon: 'flag' as const, color: PriorityColors[p].color, selected: task.priority === p }))}
        onSelect={(p) => update.mutate({ id: task.id, patch: { priority: p as Priority } })}
      />
      <OptionSheet
        visible={picker === 'assignee'}
        title="Assign to"
        onClose={() => setPicker(null)}
        options={[
          ...(members ?? []).map((m) => ({ value: m.id, label: m.id === session?.user.id ? `${m.full_name ?? 'Me'} (you)` : (m.full_name ?? m.email ?? 'Member'), dot: m.avatar_color, selected: m.id === task.assignee_id })),
          { value: '', label: 'Unassigned', icon: 'person' as const },
        ]}
        onSelect={(v) => update.mutate({ id: task.id, patch: { assignee_id: v || null } })}
      />
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
          const d = map[v] ?? null;
          update.mutate({ id: task.id, patch: { due_at: d ? d.toISOString() : null } });
        }}
      />
      <OptionSheet
        visible={picker === 'more'}
        onClose={() => setPicker(null)}
        options={[
          { value: 'toggle', label: done ? 'Mark as not done' : 'Mark as done', icon: 'check' },
          ...(task.project_id ? [{ value: 'project', label: 'Open project', icon: 'projects' as const }] : []),
          { value: 'delete', label: 'Delete task', icon: 'trash', destructive: true },
        ]}
        onSelect={(v) => {
          if (v === 'toggle') toggle.mutate({ task, completed: !done });
          else if (v === 'project' && task.project_id) router.push({ pathname: '/project/[id]', params: { id: task.project_id } });
          else if (v === 'delete') del.mutate(task, { onSuccess: () => (router.canGoBack() ? router.back() : router.replace('/')) });
        }}
      />
    </Screen>
  );
}

function FieldRow({ label, children, onPress }: { label: string; children: React.ReactNode; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.fieldRow, { borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.fieldValue}>{children}</View>
      {onPress ? <Icon name="forward" size={16} color={theme.textFaint} /> : null}
    </Pressable>
  );
}

function describeActivity(kind: string): string {
  switch (kind) {
    case 'created':
      return 'created this task';
    case 'assigned':
      return 'changed the assignee';
    case 'status':
      return 'changed the status';
    case 'completed':
      return 'marked it done';
    case 'reopened':
      return 'reopened it';
    case 'due':
      return 'changed the due date';
    case 'commented':
      return 'commented';
    default:
      return kind;
  }
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, gap: Spacing.three },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  check: { marginTop: 2 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', lineHeight: 28, letterSpacing: -0.2, padding: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fields: { borderTopWidth: StyleSheet.hairlineWidth },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth },
  fieldLabel: { width: 90, fontSize: 15 },
  fieldValue: { flex: 1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  value: { fontSize: 15, fontWeight: '500' },
  valueMuted: { fontSize: 13 },
  description: { fontSize: 15, lineHeight: 22, minHeight: 60, textAlignVertical: 'top', padding: 0 },
  section: { gap: 8 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 14, fontWeight: '600' },
  subtask: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  subText: { flex: 1, fontSize: 15 },
  subRemove: { width: 32, height: 32 },
  subInput: { flex: 1, fontSize: 15, minHeight: 36, padding: 0 },
  comment: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  commentBody: { flex: 1, gap: 2 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth },
  composerInput: { flex: 1, minHeight: 40, maxHeight: 120, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
