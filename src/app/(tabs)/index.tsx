import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Fab } from '@/components/fab';
import { TaskRow } from '@/components/task-row';
import { Button, Empty, Loading, Screen, SectionHeader, Segmented } from '@/components/ui';
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

  return (
    <>
      <Screen
        title="My Tasks"
        subtitle={`${formatShortDate(now)} · ${dueToday === 0 ? 'nothing due today' : `${dueToday} due today`}`}
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
          <Loading />
        ) : groups.length === 0 ? (
          <Empty
            icon="tasksFilled"
            title={filter === 'today' ? 'Nothing due today' : filter === 'upcoming' ? 'Nothing coming up' : 'No open tasks'}
            body="Tasks assigned to you show up here. Tap the plus button to add one."
            action={
              isRefetching ? undefined : (
                <Button title="Refresh" variant="secondary" small onPress={() => refetch()} />
              )
            }
          />
        ) : (
          groups.map((g) => {
            const items = grouped.get(g) ?? [];
            return (
              <View key={g}>
                <SectionHeader title={DueGroupLabels[g]} count={items.length} color={g === 'overdue' ? theme.danger : undefined} />
                {items.map((t, i) => (
                  <TaskRow key={t.id} task={t} last={i === items.length - 1} />
                ))}
              </View>
            );
          })
        )}
        {data && data.length > 0 && groups.length > 0 ? (
          <Text style={{ color: theme.textFaint, fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            {data.length} open {data.length === 1 ? 'task' : 'tasks'} assigned to you
          </Text>
        ) : null}
      </Screen>
      <Fab />
    </>
  );
}
