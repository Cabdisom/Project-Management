import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Avatar } from '@/components/avatar';
import { Fab } from '@/components/fab';
import { Icon } from '@/components/icon';
import { SkeletonList } from '@/components/motion';
import { TaskRow } from '@/components/task-row';
import { Empty, Screen, SectionHeader, Segmented } from '@/components/ui';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { DueGroupLabels, DueGroupOrder, dueGroup, formatShortDate, type DueGroup } from '@/lib/dates';
import { useMyTasks, type TaskListItem } from '@/lib/queries';

type Filter = 'today' | 'upcoming' | 'all';

const FILTER_GROUPS: Record<Filter, DueGroup[]> = {
  today: ['overdue', 'today'],
  upcoming: ['tomorrow', 'week', 'later'],
  all: DueGroupOrder,
};

export default function MyTasksScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<Filter>('today');
  const { data, isLoading, refetch, isRefetching } = useMyTasks();

  const grouped = useMemo(() => {
    const map = new Map<DueGroup, TaskListItem[]>();
    for (const t of data ?? []) {
      const g = dueGroup(t.due_at);
      map.set(g, [...(map.get(g) ?? []), t]);
    }
    return map;
  }, [data]);

  const now = new Date(useNow());
  const dueToday = (grouped.get('today')?.length ?? 0) + (grouped.get('overdue')?.length ?? 0);
  const groups = FILTER_GROUPS[filter].filter((g) => (grouped.get(g)?.length ?? 0) > 0);
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.full_name?.split(' ')[0];
  const allDoneToday = !isLoading && filter === 'today' && groups.length === 0 && (data?.length ?? 0) > 0;

  let rowIndex = 0;

  return (
    <>
      <Screen
        title="My Tasks"
        subtitle={`${formatShortDate(now)} · ${dueToday === 0 ? 'nothing due today' : `${dueToday} due today`}`}
        refreshing={isRefetching}
        onRefresh={refetch}
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')}>
            <Avatar name={profile?.full_name ?? profile?.email} color={profile?.avatar_color} size={40} />
          </Pressable>
        }
        headerBottom={
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'all', label: 'All' },
            ]}
          />
        }>
        {isLoading ? (
          <SkeletonList rows={5} />
        ) : allDoneToday ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.celebrate}>
            <Animated.View entering={ZoomIn.springify().damping(10).delay(100)} style={[styles.celebrateIcon, { backgroundColor: theme.accentSoft }]}>
              <Icon name="circleCheck" size={44} color={theme.accent} />
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(250)} style={[styles.celebrateTitle, { color: theme.text }]}>
              {greeting}{firstName ? `, ${firstName}` : ''}. All clear for today.
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(350)} style={[styles.celebrateBody, { color: theme.textSecondary }]}>
              {data!.length} {data!.length === 1 ? 'task' : 'tasks'} waiting in Upcoming.
            </Animated.Text>
          </Animated.View>
        ) : groups.length === 0 ? (
          <Empty
            icon="tasksFilled"
            title={filter === 'today' ? 'Nothing due today' : filter === 'upcoming' ? 'Nothing coming up' : 'No open tasks'}
            body="Tasks assigned to you show up here. Tap the plus button to add one."
          />
        ) : (
          groups.map((g) => {
            const items = grouped.get(g) ?? [];
            return (
              <Animated.View key={g} layout={LinearTransition.duration(220)}>
                <SectionHeader title={DueGroupLabels[g]} count={items.length} color={g === 'overdue' ? theme.danger : undefined} />
                {items.map((t, i) => (
                  <TaskRow key={t.id} task={t} index={rowIndex++} last={i === items.length - 1} />
                ))}
              </Animated.View>
            );
          })
        )}
        {data && data.length > 0 && groups.length > 0 ? (
          <Animated.Text entering={FadeIn.delay(400)} style={[styles.footer, { color: theme.textFaint }]}>
            {data.length} open {data.length === 1 ? 'task' : 'tasks'} assigned to you · swipe a task to finish or push it to tomorrow
          </Animated.Text>
        ) : null}
      </Screen>
      <Fab />
    </>
  );
}

const styles = StyleSheet.create({
  celebrate: { alignItems: 'center', gap: 10, paddingVertical: 56, paddingHorizontal: 24 },
  celebrateIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  celebrateTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: -0.2 },
  celebrateBody: { fontSize: 14, textAlign: 'center' },
  footer: { fontSize: 13, textAlign: 'center', marginTop: 24, lineHeight: 18 },
});
