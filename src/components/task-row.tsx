import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { Checkbox, PressableScale, haptic } from '@/components/motion';
import { PriorityColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addDays, formatDue, isOverdue, startOfDay } from '@/lib/dates';
import { useToggleTask, useUpdateTask, type TaskListItem } from '@/lib/queries';

type Props = {
  task: TaskListItem;
  showProject?: boolean;
  showAssignee?: boolean;
  last?: boolean;
  index?: number;
};

/**
 * One task in a list. Tap opens it, the circle completes it,
 * swipe right completes it, swipe left pushes it to tomorrow.
 */
export function TaskRow({ task, showProject = true, showAssignee = false, last, index = 0 }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const toggle = useToggleTask();
  const update = useUpdateTask();
  const swipe = useRef<SwipeableMethods>(null);
  const done = !!task.completed_at;
  const overdue = !done && isOverdue(task.due_at);
  const pr = PriorityColors[task.priority] ?? PriorityColors.none;

  const complete = (next: boolean) => toggle.mutate({ task, completed: next });
  const tomorrow = () => {
    const d = startOfDay(addDays(new Date(), 1));
    if (task.due_at) {
      const old = new Date(task.due_at);
      d.setHours(old.getHours(), old.getMinutes(), 0, 0);
    }
    update.mutate({ id: task.id, patch: { due_at: d.toISOString() } });
  };

  return (
    <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 12) * 25)} exiting={FadeOutLeft.duration(180)} layout={LinearTransition.duration(220)}>
      <Swipeable
        ref={swipe}
        friction={2}
        leftThreshold={64}
        rightThreshold={64}
        overshootLeft={false}
        overshootRight={false}
        renderLeftActions={() => (
          <View style={[styles.action, { backgroundColor: theme.success }]}>
            <Icon name="check" size={20} color="#FFFFFF" weight="bold" />
            <Text style={styles.actionText}>{done ? 'Reopen' : 'Done'}</Text>
          </View>
        )}
        renderRightActions={() => (
          <View style={[styles.action, styles.actionRight, { backgroundColor: theme.info }]}>
            <Icon name="calendar" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Tomorrow</Text>
          </View>
        )}
        onSwipeableOpen={(direction) => {
          haptic('medium');
          swipe.current?.close();
          if (direction === 'left') complete(!done);
          else tomorrow();
        }}>
        <PressableScale
          accessibilityRole="button"
          scaleTo={0.985}
          onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
          style={[styles.row, { backgroundColor: theme.background, borderBottomColor: theme.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth }]}>
          <Checkbox checked={done} onChange={complete} />
          <View style={styles.body}>
            <Text numberOfLines={2} style={[styles.title, { color: done ? theme.textFaint : theme.text, textDecorationLine: done ? 'line-through' : 'none' }]}>
              {task.title}
            </Text>
            {(showProject && task.project) || task.due_at ? (
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
            ) : null}
          </View>
          {showAssignee && task.assignee ? <Avatar name={task.assignee.full_name} color={task.assignee.avatar_color} size={26} /> : null}
          {task.priority !== 'none' ? <Icon name="flag" size={16} color={pr.color} /> : null}
        </PressableScale>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, minHeight: 60 },
  body: { flex: 1, gap: 3, minWidth: 0 },
  title: { fontSize: 16, fontWeight: '500', lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2 },
  metaText: { fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  action: { width: 96, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 12, marginVertical: 4, marginRight: 8 },
  actionRight: { marginRight: 0, marginLeft: 8 },
  actionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
