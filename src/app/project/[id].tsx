import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Fab } from '@/components/fab';
import { Icon } from '@/components/icon';
import { OptionSheet } from '@/components/sheet';
import { TaskRow } from '@/components/task-row';
import { Empty, IconButton, Loading, Screen, SectionHeader, Segmented } from '@/components/ui';
import { PriorityColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDue, formatShortDate, isOverdue } from '@/lib/dates';
import { useProject, useUpdateProject, useUpdateTask, type TaskListItem } from '@/lib/queries';

type View_ = 'board' | 'list';

export default function ProjectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error } = useProject(id);
  const update = useUpdateTask();
  const updateProject = useUpdateProject();
  const [view, setView] = useState<View_>('board');
  const [moving, setMoving] = useState<TaskListItem | null>(null);
  const [more, setMore] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  const columns = useMemo(() => {
    if (!data) return [];
    return data.statuses.map((s) => ({ status: s, tasks: data.tasks.filter((t) => t.status_id === s.id) }));
  }, [data]);

  if (isLoading) {
    return (
      <Screen back="/projects">
        <Loading />
      </Screen>
    );
  }
  if (error || !data) {
    return (
      <Screen back="/projects">
        <Empty title="Project not found" body="It may have been archived or deleted." />
      </Screen>
    );
  }

  const { project, tasks } = data;
  const wide = width >= 900;
  const columnWidth = wide ? 300 : Math.min(width - 56, 340);
  const doneCount = tasks.filter((t) => t.completed_at).length;
  const due = project.due_date ? formatShortDate(new Date(`${project.due_date}T00:00:00`)) : null;

  return (
    <>
      <Screen
        back="/projects"
        padded={false}
        scroll={view === 'list'}
        title={project.name}
        subtitle={`${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} · ${doneCount} done${due ? ` · Due ${due}` : ''}`}
        right={<IconButton name="more" label="Project options" onPress={() => setMore(true)} />}
        headerBottom={
          <View style={styles.toolbar}>
            <View style={{ width: 180 }}>
              <Segmented value={view} onChange={setView} options={[{ value: 'board', label: 'Board' }, { value: 'list', label: 'List' }]} />
            </View>
            <Pressable accessibilityRole="button" onPress={() => setHideDone((v) => !v)} style={[styles.toggle, { borderColor: theme.border, backgroundColor: hideDone ? theme.surface : 'transparent' }]}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: theme.textSecondary }}>{hideDone ? 'Show done' : 'Hide done'}</Text>
            </Pressable>
          </View>
        }>
        {view === 'board' ? (
          <ScrollView
            horizontal
            pagingEnabled={!wide}
            snapToInterval={wide ? undefined : columnWidth + Spacing.three}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={wide}
            contentContainerStyle={[styles.board, { paddingLeft: Spacing.three }]}
            style={{ backgroundColor: theme.surfaceAlt }}>
            {columns
              .filter((c) => !(hideDone && c.status.is_done))
              .map(({ status, tasks: list }) => (
                <View key={status.id} style={[styles.column, { width: columnWidth }]}>
                  <View style={styles.columnHeader}>
                    <View style={[styles.dot, { backgroundColor: status.color }]} />
                    <Text style={[styles.columnTitle, { color: theme.text }]}>{status.name}</Text>
                    <Text style={[styles.columnCount, { color: theme.textSecondary }]}>{list.length}</Text>
                  </View>
                  <ScrollView style={styles.columnScroll} contentContainerStyle={styles.columnList} showsVerticalScrollIndicator={false}>
                    {list.map((t) => (
                      <Card key={t.id} task={t} onMove={() => setMoving(t)} />
                    ))}
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push({ pathname: '/new-task', params: { projectId: project.id, statusId: status.id } })}
                      style={({ pressed }) => [styles.addRow, { opacity: pressed ? 0.6 : 1 }]}>
                      <Icon name="plus" size={16} color={theme.textSecondary} />
                      <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '500' }}>Add task</Text>
                    </Pressable>
                  </ScrollView>
                </View>
              ))}
          </ScrollView>
        ) : (
          <View style={styles.listPad}>
            {tasks.length === 0 ? (
              <Empty title="No tasks yet" body="Add the first task with the plus button." />
            ) : (
              columns
                .filter((c) => !(hideDone && c.status.is_done))
                .map(({ status, tasks: list }) =>
                  list.length === 0 ? null : (
                    <View key={status.id}>
                      <SectionHeader title={status.name} count={list.length} color={status.color} />
                      {list.map((t, i) => (
                        <TaskRow key={t.id} task={t} showProject={false} showAssignee last={i === list.length - 1} />
                      ))}
                    </View>
                  ),
                )
            )}
          </View>
        )}
      </Screen>
      <Fab projectId={project.id} />

      <OptionSheet
        visible={!!moving}
        title={moving ? `Move "${moving.title}" to` : undefined}
        onClose={() => setMoving(null)}
        options={data.statuses.map((s) => ({ value: s.id, label: s.name, dot: s.color, selected: s.id === moving?.status_id }))}
        onSelect={(statusId) => {
          if (!moving) return;
          const s = data.statuses.find((x) => x.id === statusId);
          update.mutate({ id: moving.id, patch: { status_id: statusId, completed_at: s?.is_done ? (moving.completed_at ?? new Date().toISOString()) : null } });
        }}
      />
      <OptionSheet
        visible={more}
        onClose={() => setMore(false)}
        options={[{ value: 'archive', label: 'Archive project', icon: 'archive', destructive: true }]}
        onSelect={(v) => {
          if (v === 'archive') updateProject.mutate({ id: project.id, patch: { archived_at: new Date().toISOString() } }, { onSuccess: () => router.replace('/projects') });
        }}
      />
    </>
  );
}

function Card({ task, onMove }: { task: TaskListItem; onMove: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const done = !!task.completed_at;
  const overdue = !done && isOverdue(task.due_at);
  const pr = PriorityColors[task.priority];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
      onLongPress={onMove}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.8 : done ? 0.75 : 1 }]}>
      <View style={styles.cardTop}>
        <Text style={[styles.cardTitle, { color: done ? theme.textSecondary : theme.text, textDecorationLine: done ? 'line-through' : 'none' }]}>{task.title}</Text>
        <IconButton name="more" label="Move task" size={16} color={theme.textFaint} onPress={onMove} style={styles.cardMore} />
      </View>
      <View style={styles.cardBottom}>
        {task.due_at ? (
          <View style={styles.inline}>
            <Icon name="calendar" size={13} color={overdue ? theme.danger : theme.textSecondary} />
            <Text style={{ fontSize: 12, color: overdue ? theme.danger : theme.textSecondary, fontWeight: overdue ? '600' : '400' }}>{formatDue(task.due_at)}</Text>
          </View>
        ) : (
          <View />
        )}
        <View style={styles.inline}>
          {task.priority !== 'none' ? <Icon name="flag" size={14} color={pr.color} /> : null}
          {task.assignee ? <Avatar name={task.assignee.full_name} color={task.assignee.avatar_color} size={24} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  toggle: { height: 34, paddingHorizontal: 12, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  board: { gap: Spacing.three, paddingVertical: Spacing.three, paddingRight: Spacing.three },
  column: { gap: 10 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  columnTitle: { fontSize: 15, fontWeight: '600' },
  columnCount: { fontSize: 15, fontWeight: '500' },
  columnScroll: { flexGrow: 0 },
  columnList: { gap: 10, paddingBottom: 120 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 20 },
  cardMore: { width: 28, height: 28, marginTop: -6, marginRight: -6 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 8 },
  listPad: { paddingHorizontal: Spacing.three },
});
