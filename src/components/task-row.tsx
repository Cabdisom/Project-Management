import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { PriorityColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDue, isOverdue } from '@/lib/dates';
import { useToggleTask, type TaskListItem } from '@/lib/queries';

type Props = {
  task: TaskListItem;
  showProject?: boolean;
  showAssignee?: boolean;
  last?: boolean;
};

export function TaskRow({ task, showProject = true, showAssignee = false, last }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const toggle = useToggleTask();
  const done = !!task.completed_at;
  const overdue = !done && isOverdue(task.due_at);
  const pr = PriorityColors[task.priority] ?? PriorityColors.none;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
      style={({ pressed }) => [styles.row, { borderBottomColor: theme.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, opacity: pressed ? 0.7 : 1 }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? 'Mark as not done' : 'Mark as done'}
        hitSlop={8}
        onPress={() => toggle.mutate({ task, completed: !done })}
        style={[styles.check, { borderColor: done ? theme.accent : theme.textFaint, backgroundColor: done ? theme.accent : 'transparent' }]}>
        {done ? <Icon name="check" size={14} color={theme.onAccent} weight="bold" /> : null}
      </Pressable>
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.title, { color: done ? theme.textFaint : theme.text, textDecorationLine: done ? 'line-through' : 'none' }]}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          {showProject && task.project ? (
            <>
              <View style={[styles.dot, { backgroundColor: task.project.color }]} />
              <Text numberOfLines={1} style={[styles.metaText, { color: theme.textSecondary }]}>
                {task.project.name}
              </Text>
              {task.due_at ? <Text style={[styles.metaText, { color: theme.textFaint }]}>·</Text> : null}
            </>
          ) : null}
          {task.due_at ? (
            <Text style={[styles.metaText, { color: overdue ? theme.danger : theme.textSecondary, fontWeight: overdue ? '600' : '400' }]}>{formatDue(task.due_at)}</Text>
          ) : null}
        </View>
      </View>
      {showAssignee && task.assignee ? <Avatar name={task.assignee.full_name} color={task.assignee.avatar_color} size={26} /> : null}
      {task.priority !== 'none' ? <Icon name="flag" size={16} color={pr.color} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, minHeight: 56 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '500', lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2 },
  metaText: { fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
