import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';

import { Avatar } from '@/components/avatar';
import { Icon, type IconName } from '@/components/icon';
import { PressableScale, SkeletonList, haptic } from '@/components/motion';
import { OptionSheet } from '@/components/sheet';
import { Chip, Empty, IconButton, Row, Screen, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { addDays, dayLabel, formatRelative, startOfDay } from '@/lib/dates';
import { useInbox, useNotificationActions, type NotificationItem } from '@/lib/queries';

type Filter = 'all' | 'assigned' | 'comment' | 'snoozed';

const KIND_ICON: Record<string, IconName> = { assigned: 'person', comment: 'comment', due: 'calendar', mention: 'comment' };

function tomorrow9() {
  const d = startOfDay(addDays(new Date(), 1));
  d.setHours(9);
  return d;
}
function nextMonday9() {
  const d = startOfDay(new Date());
  const m = addDays(d, ((8 - d.getDay()) % 7) || 7);
  m.setHours(9);
  return m;
}

export default function InboxScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [sheetFor, setSheetFor] = useState<NotificationItem | null>(null);
  const { data, isLoading, refetch, isRefetching } = useInbox();
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

  let rowIndex = 0;

  return (
    <Screen
      title="Inbox"
      subtitle={unread === 0 ? 'All caught up' : `${unread} unread`}
      refreshing={isRefetching}
      onRefresh={refetch}
      right={
        unread > 0 ? (
          <Pressable accessibilityRole="button" onPress={() => { haptic('light'); markAllRead.mutate(); }} style={styles.textButton}>
            <Text style={{ color: theme.accent, fontWeight: '600' }}>Mark all read</Text>
          </Pressable>
        ) : undefined
      }
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
        <View style={styles.sectionPad}>
          <SkeletonList rows={4} />
        </View>
      ) : sections.length === 0 ? (
        <Empty icon="inboxFilled" title={filter === 'snoozed' ? 'Nothing snoozed' : 'Inbox is empty'} body="When someone assigns you a task or comments on your work, it shows up here." />
      ) : (
        sections.map(([label, list]) => (
          <Animated.View key={label} layout={LinearTransition.duration(220)}>
            <View style={styles.sectionPad}>
              <SectionHeader title={label} />
            </View>
            {list.map((n) => (
              <InboxRow key={n.id} n={n} index={rowIndex++} onOpen={() => open(n)} onMore={() => setSheetFor(n)} onDone={() => remove.mutate(n.id)} onSnooze={() => snooze.mutate({ id: n.id, until: tomorrow9() })} />
            ))}
          </Animated.View>
        ))
      )}
      <Text style={[styles.hint, { color: theme.textFaint }]}>{sections.length > 0 ? 'Swipe right to clear, swipe left to snooze' : ''}</Text>
      <OptionSheet
        visible={!!sheetFor}
        title={sheetFor?.body}
        onClose={() => setSheetFor(null)}
        options={[
          { value: 'read', label: sheetFor?.read_at ? 'Mark as unread' : 'Mark as read', icon: 'check' },
          { value: 'tomorrow', label: 'Snooze until tomorrow 9:00', icon: 'snooze' },
          { value: 'monday', label: 'Snooze until Monday 9:00', icon: 'snooze' },
          { value: 'delete', label: 'Remove', icon: 'trash', destructive: true },
        ]}
        onSelect={(v) => {
          if (!sheetFor) return;
          if (v === 'read') {
            if (sheetFor.read_at) snooze.mutate({ id: sheetFor.id, until: new Date(0) });
            else markRead.mutate(sheetFor.id);
          } else if (v === 'tomorrow') snooze.mutate({ id: sheetFor.id, until: tomorrow9() });
          else if (v === 'monday') snooze.mutate({ id: sheetFor.id, until: nextMonday9() });
          else if (v === 'delete') remove.mutate(sheetFor.id);
        }}
      />
    </Screen>
  );
}

function InboxRow({ n, index, onOpen, onMore, onDone, onSnooze }: { n: NotificationItem; index: number; onOpen: () => void; onMore: () => void; onDone: () => void; onSnooze: () => void }) {
  const theme = useTheme();
  const swipe = useRef<SwipeableMethods>(null);
  const unreadRow = !n.read_at;
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
            <Text style={styles.actionText}>Clear</Text>
          </View>
        )}
        renderRightActions={() => (
          <View style={[styles.action, { backgroundColor: theme.textSecondary }]}>
            <Icon name="snooze" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Snooze</Text>
          </View>
        )}
        onSwipeableOpen={(direction) => {
          haptic('medium');
          swipe.current?.close();
          if (direction === 'left') onDone();
          else onSnooze();
        }}>
        <View style={[styles.rowWrap, { backgroundColor: unreadRow ? theme.unread : theme.background, borderBottomColor: theme.border }]}>
          <PressableScale accessibilityRole="button" scaleTo={0.985} onPress={onOpen} onLongPress={onMore} style={styles.row}>
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
          </PressableScale>
          <IconButton name="more" label="Options" size={18} color={theme.textFaint} onPress={onMore} style={styles.moreButton} />
        </View>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  textButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  sectionPad: { paddingHorizontal: Spacing.three },
  rowWrap: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: StyleSheet.hairlineWidth, paddingRight: Spacing.two },
  row: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingLeft: Spacing.three, paddingVertical: 12 },
  kindIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3, minWidth: 0 },
  text: { fontSize: 15, lineHeight: 20 },
  meta: { fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  moreButton: { width: 36, height: 36, marginTop: 8 },
  action: { width: 96, alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 12, textAlign: 'center', marginTop: Spacing.four, paddingHorizontal: Spacing.three },
});
