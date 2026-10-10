import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Icon, type IconName } from '@/components/icon';
import { OptionSheet } from '@/components/sheet';
import { Chip, Empty, IconButton, Loading, Row, Screen, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { addDays, dayLabel, formatRelative, startOfDay } from '@/lib/dates';
import { useInbox, useNotificationActions, type NotificationItem } from '@/lib/queries';

type Filter = 'all' | 'assigned' | 'comment' | 'snoozed';

const KIND_ICON: Record<string, IconName> = { assigned: 'person', comment: 'comment', due: 'calendar', mention: 'comment' };

export default function InboxScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [snoozeFor, setSnoozeFor] = useState<NotificationItem | null>(null);
  const { data, isLoading } = useInbox();
  const { markRead, markAllRead, snooze, remove } = useNotificationActions();

  const now = useNow();
  const items = useMemo(() => {
    const list = data ?? [];
    const active = (n: NotificationItem) => !n.snoozed_until || new Date(n.snoozed_until).getTime() <= now;
    if (filter === 'snoozed') return list.filter((n) => !active(n));
    const visible = list.filter(active);
    if (filter === 'assigned') return visible.filter((n) => n.kind === 'assigned');
    if (filter === 'comment') return visible.filter((n) => n.kind === 'comment' || n.kind === 'mention');
    return visible;
  }, [data, filter, now]);

  const unread = (data ?? []).filter((n) => !n.read_at && (!n.snoozed_until || new Date(n.snoozed_until).getTime() <= now)).length;

  const sections = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const n of items) {
      const label = dayLabel(n.created_at);
      map.set(label, [...(map.get(label) ?? []), n]);
    }
    return [...map.entries()];
  }, [items]);

  const open = (n: NotificationItem) => {
    if (!n.read_at) markRead.mutate(n.id);
    if (n.task_id) router.push({ pathname: '/task/[id]', params: { id: n.task_id } });
  };

  const tomorrow9 = () => {
    const d = startOfDay(addDays(new Date(), 1));
    d.setHours(9);
    return d;
  };
  const nextMonday9 = () => {
    const d = startOfDay(new Date());
    const delta = ((8 - d.getDay()) % 7) || 7;
    const m = addDays(d, delta);
    m.setHours(9);
    return m;
  };

  return (
    <Screen
      title="Inbox"
      subtitle={unread === 0 ? 'All caught up' : `${unread} unread`}
      right={unread > 0 ? <Pressable accessibilityRole="button" onPress={() => markAllRead.mutate()} style={styles.textButton}><Text style={{ color: theme.accent, fontWeight: '600' }}>Mark all read</Text></Pressable> : undefined}
      headerBottom={
        <Row gap={8}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Assigned" selected={filter === 'assigned'} onPress={() => setFilter('assigned')} />
          <Chip label="Comments" selected={filter === 'comment'} onPress={() => setFilter('comment')} />
          <Chip label="Snoozed" selected={filter === 'snoozed'} onPress={() => setFilter('snoozed')} />
        </Row>
      }
      padded={false}>
      {isLoading ? (
        <Loading />
      ) : sections.length === 0 ? (
        <Empty icon="inboxFilled" title={filter === 'snoozed' ? 'Nothing snoozed' : 'Inbox is empty'} body="When someone assigns you a task or comments on your work, it shows up here." />
      ) : (
        sections.map(([label, list]) => (
          <View key={label}>
            <View style={styles.sectionPad}>
              <SectionHeader title={label} />
            </View>
            {list.map((n) => {
              const unreadRow = !n.read_at;
              return (
                <Pressable
                  key={n.id}
                  accessibilityRole="button"
                  onPress={() => open(n)}
                  onLongPress={() => setSnoozeFor(n)}
                  style={({ pressed }) => [styles.row, { backgroundColor: unreadRow ? theme.unread : 'transparent', borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
                  {n.actor ? (
                    <Avatar name={n.actor.full_name} color={n.actor.avatar_color} size={36} />
                  ) : (
                    <View style={[styles.kindIcon, { backgroundColor: theme.surface }]}>
                      <Icon name={KIND_ICON[n.kind] ?? 'bell'} size={18} color={theme.textSecondary} />
                    </View>
                  )}
                  <View style={styles.body}>
                    <Text style={[styles.text, { color: theme.text, fontWeight: unreadRow ? '600' : '400' }]} numberOfLines={3}>
                      {n.body}
                    </Text>
                    <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>
                      {n.task?.project?.name ? `${n.task.project.name} · ` : ''}
                      {formatRelative(n.created_at)}
                    </Text>
                  </View>
                  {unreadRow ? <View style={[styles.dot, { backgroundColor: theme.accent }]} /> : null}
                  <IconButton name="more" label="Options" size={18} color={theme.textFaint} onPress={() => setSnoozeFor(n)} style={styles.moreButton} />
                </Pressable>
              );
            })}
          </View>
        ))
      )}
      <OptionSheet
        visible={!!snoozeFor}
        title={snoozeFor?.body}
        onClose={() => setSnoozeFor(null)}
        options={[
          { value: 'read', label: snoozeFor?.read_at ? 'Mark as unread' : 'Mark as read', icon: 'check' },
          { value: 'tomorrow', label: 'Snooze until tomorrow 9:00', icon: 'snooze' },
          { value: 'monday', label: 'Snooze until Monday 9:00', icon: 'snooze' },
          { value: 'delete', label: 'Remove', icon: 'trash', destructive: true },
        ]}
        onSelect={(v) => {
          if (!snoozeFor) return;
          if (v === 'read') {
            if (snoozeFor.read_at) snooze.mutate({ id: snoozeFor.id, until: new Date(0) });
            else markRead.mutate(snoozeFor.id);
          } else if (v === 'tomorrow') snooze.mutate({ id: snoozeFor.id, until: tomorrow9() });
          else if (v === 'monday') snooze.mutate({ id: snoozeFor.id, until: nextMonday9() });
          else if (v === 'delete') remove.mutate(snoozeFor.id);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  textButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  sectionPad: { paddingHorizontal: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: Spacing.three, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  kindIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3, minWidth: 0 },
  text: { fontSize: 15, lineHeight: 20 },
  meta: { fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  moreButton: { width: 32, height: 32, marginTop: -6, marginRight: -8 },
});
