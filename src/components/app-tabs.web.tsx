import { Link } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Icon, type IconName } from '@/components/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { useUnreadCount } from '@/lib/queries';

const SIDEBAR_BREAKPOINT = 900;

const TABS: { name: string; href: '/' | '/inbox' | '/projects' | '/search'; label: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', href: '/', label: 'My Tasks', icon: 'tasks', iconActive: 'tasksFilled' },
  { name: 'inbox', href: '/inbox', label: 'Inbox', icon: 'inbox', iconActive: 'inboxFilled' },
  { name: 'projects', href: '/projects', label: 'Projects', icon: 'projects', iconActive: 'projectsFilled' },
  { name: 'search', href: '/search', label: 'Search', icon: 'search', iconActive: 'search' },
];

export default function AppTabs() {
  const { width } = useWindowDimensions();
  const sidebar = width >= SIDEBAR_BREAKPOINT;
  const theme = useTheme();
  const unread = useUnreadCount();
  const { workspace, profile } = useAuth();

  return (
    <Tabs>
      <View style={[styles.shell, sidebar && styles.shellRow, { backgroundColor: theme.background }]}>
        {sidebar ? (
          <TabList style={[styles.sidebar, { borderRightColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
            <Link href="/settings" asChild>
              <Pressable style={styles.workspaceRow}>
                <Avatar name={workspace?.name} color={theme.accent} size={30} />
                <Text numberOfLines={1} style={[styles.workspaceName, { color: theme.text }]}>
                  {workspace?.name ?? 'Workspace'}
                </Text>
              </Pressable>
            </Link>
            {TABS.map((t) => (
              <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
                <SidebarItem icon={t.icon} iconActive={t.iconActive} label={t.label} badge={t.name === 'inbox' ? unread : 0} />
              </TabTrigger>
            ))}
            <View style={styles.sidebarSpacer} />
            <Link href="/new-task" asChild>
              <Pressable style={[styles.newTask, { backgroundColor: theme.accent }]}>
                <Icon name="plus" size={18} color={theme.onAccent} />
                <Text style={[styles.newTaskText, { color: theme.onAccent }]}>New task</Text>
              </Pressable>
            </Link>
            <Link href="/settings" asChild>
              <Pressable style={styles.profileRow}>
                <Avatar name={profile?.full_name ?? profile?.email} color={profile?.avatar_color} size={30} />
                <Text numberOfLines={1} style={[styles.profileName, { color: theme.textSecondary }]}>
                  {profile?.full_name ?? profile?.email ?? 'You'}
                </Text>
                <Icon name="settings" size={18} color={theme.textFaint} />
              </Pressable>
            </Link>
          </TabList>
        ) : null}
        <View style={styles.content}>
          <TabSlot style={styles.slot} />
        </View>
        {!sidebar ? (
          <TabList style={[styles.bottomBar, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
            {TABS.map((t) => (
              <TabTrigger key={t.name} name={t.name} href={t.href} asChild>
                <BottomItem icon={t.icon} iconActive={t.iconActive} label={t.label} badge={t.name === 'inbox' ? unread : 0} />
              </TabTrigger>
            ))}
          </TabList>
        ) : null}
      </View>
    </Tabs>
  );
}

type ItemProps = TabTriggerSlotProps & { icon: IconName; iconActive: IconName; label: string; badge: number };

function BottomItem({ icon, iconActive, label, badge, isFocused, ...props }: ItemProps) {
  const theme = useTheme();
  const color = isFocused ? theme.accent : theme.textSecondary;
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} style={styles.bottomItem}>
      <View>
        <Icon name={isFocused ? iconActive : icon} size={26} color={color} />
        {badge > 0 ? <Badge value={badge} /> : null}
      </View>
      <Text style={[styles.bottomLabel, { color, fontWeight: isFocused ? '600' : '500' }]}>{label}</Text>
    </Pressable>
  );
}

function SidebarItem({ icon, iconActive, label, badge, isFocused, ...props }: ItemProps) {
  const theme = useTheme();
  const color = isFocused ? theme.text : theme.textSecondary;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={[styles.sidebarItem, isFocused && { backgroundColor: theme.surface }]}>
      <Icon name={isFocused ? iconActive : icon} size={20} color={isFocused ? theme.accent : color} />
      <Text style={[styles.sidebarLabel, { color, fontWeight: isFocused ? '600' : '500' }]}>{label}</Text>
      {badge > 0 ? (
        <View style={[styles.sidebarBadge, { backgroundColor: theme.danger }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Badge({ value }: { value: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: theme.background }]}>
      <Text style={styles.badgeText}>{value > 99 ? '99+' : value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, height: '100%' },
  shellRow: { flexDirection: 'row' },
  content: { flex: 1, minWidth: 0 },
  slot: { flex: 1, height: '100%' },
  sidebar: { width: 240, borderRightWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: 2 },
  workspaceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, minHeight: 44, marginBottom: Spacing.three },
  workspaceName: { fontSize: 15, fontWeight: '600', flex: 1 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40, paddingHorizontal: 10, borderRadius: 8 },
  sidebarLabel: { fontSize: 14, flex: 1 },
  sidebarBadge: { borderRadius: 9, paddingHorizontal: 6, paddingVertical: 1 },
  sidebarSpacer: { flex: 1 },
  newTask: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 40, borderRadius: 10, marginBottom: Spacing.three },
  newTaskText: { fontSize: 14, fontWeight: '600' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, minHeight: 44 },
  profileName: { fontSize: 14, flex: 1 },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, paddingBottom: 12, paddingHorizontal: 6 },
  bottomItem: { alignItems: 'center', gap: 3, minWidth: 64, minHeight: 44 },
  bottomLabel: { fontSize: 11 },
  badge: { position: 'absolute', top: -4, right: -10, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
});
