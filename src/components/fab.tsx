import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';

/** Floating "add task" button shown on the main tabs. */
export function Fab({ projectId, statusId }: { projectId?: string; statusId?: string }) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === 'web' ? 88 : insets.bottom + 72;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add task"
      onPress={() => router.push({ pathname: '/new-task', params: { projectId: projectId ?? '', statusId: statusId ?? '' } })}
      style={({ pressed }) => [styles.fab, { bottom, backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}>
      <Icon name="plus" size={26} color={theme.onAccent} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
