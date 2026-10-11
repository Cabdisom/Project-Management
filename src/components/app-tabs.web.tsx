import { Tabs } from 'expo-router/js-tabs';
import { useWindowDimensions } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';
import { useUnreadCount } from '@/lib/queries';

const SIDEBAR_BREAKPOINT = 900;

const TABS: { name: string; label: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', label: 'My Tasks', icon: 'tasks', iconActive: 'tasksFilled' },
  { name: 'inbox', label: 'Inbox', icon: 'inbox', iconActive: 'inboxFilled' },
  { name: 'projects', label: 'Projects', icon: 'projects', iconActive: 'projectsFilled' },
  { name: 'search', label: 'Search', icon: 'search', iconActive: 'search' },
];

/** Web layout: a left sidebar on wide screens, a bottom tab bar on phones. */
export default function AppTabs() {
  const { width } = useWindowDimensions();
  const sidebar = width >= SIDEBAR_BREAKPOINT;
  const theme = useTheme();
  const unread = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarPosition: sidebar ? 'left' : 'bottom',
        tabBarLabelPosition: sidebar ? 'beside-icon' : 'below-icon',
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarActiveBackgroundColor: sidebar ? theme.accentSoft : 'transparent',
        tabBarStyle: sidebar
          ? { backgroundColor: theme.surfaceAlt, borderRightColor: theme.border, minWidth: 220, paddingTop: 16 }
          : { backgroundColor: theme.background, borderTopColor: theme.border, height: 64, paddingTop: 6, paddingBottom: 8 },
        tabBarItemStyle: sidebar ? { justifyContent: 'flex-start', paddingHorizontal: 12, borderRadius: 8, marginHorizontal: 8 } : undefined,
        tabBarLabelStyle: { fontSize: sidebar ? 14 : 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: theme.background },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.label,
            tabBarBadge: t.name === 'inbox' && unread > 0 ? (unread > 99 ? '99+' : unread) : undefined,
            tabBarIcon: ({ color, focused }) => <Icon name={focused ? t.iconActive : t.icon} size={sidebar ? 20 : 26} color={String(color)} />,
          }}
        />
      ))}
    </Tabs>
  );
}
