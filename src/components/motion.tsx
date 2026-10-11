import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Light tap feedback on phones. Does nothing on the web. */
export function haptic(kind: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (Platform.OS === 'web') return;
  try {
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics are a nicety; ignore devices without them.
  }
}

/** A pressable that gently shrinks while pressed, like native iOS buttons. */
export function PressableScale({ children, style, scaleTo = 0.97, onPressIn, onPressOut, ...rest }: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.set(withSpring(scaleTo, { damping: 18, stiffness: 300 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, { damping: 14, stiffness: 240 }));
        onPressOut?.(e);
      }}
      style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
}

type CheckboxProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: number;
  label?: string;
  /** Delay before onChange fires, so the fill animation is seen first. */
  delay?: number;
};

/**
 * Round checkbox that pops when ticked. Calls onChange after a short delay so
 * the person sees the tick before the row leaves the list.
 */
export function Checkbox({ checked, onChange, size = 22, label, delay = 320 }: CheckboxProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const fill = useSharedValue(checked ? 1 : 0);
  const pending = useSharedValue(0);

  useEffect(() => {
    fill.set(withTiming(checked ? 1 : 0, { duration: 180 }));
    pending.set(0);
  }, [checked, fill, pending]);

  const ring = useAnimatedStyle(() => {
    const on = Math.max(fill.value, pending.value);
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: on > 0.5 ? theme.accent : 'transparent',
      borderColor: on > 0.5 ? theme.accent : theme.textFaint,
    };
  });
  const tick = useAnimatedStyle(() => {
    const on = Math.max(fill.value, pending.value);
    return { opacity: on, transform: [{ scale: 0.6 + 0.4 * on }] };
  });

  const press = () => {
    const next = !checked;
    haptic(next ? 'success' : 'light');
    scale.set(withSequence(withSpring(1.25, { damping: 10, stiffness: 400 }), withSpring(1, { damping: 12, stiffness: 300 })));
    pending.set(withTiming(next ? 1 : 0, { duration: 160 }));
    setTimeout(() => onChange(next), next ? delay : 0);
  };

  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label ?? (checked ? 'Mark as not done' : 'Mark as done')} hitSlop={10} onPress={press}>
      <Animated.View style={[styles.checkbox, { width: size, height: size, borderRadius: size / 2 }, ring]}>
        <Animated.View style={tick}>
          <Icon name="check" size={Math.round(size * 0.62)} color={theme.onAccent} weight="bold" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/** Grey pulsing block used while data loads. */
export function Skeleton({ width = '100%', height = 16, radius = 6, style }: { width?: number | `${number}%`; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.set(withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: theme.surface }, animated, style]} />;
}

/** A few placeholder rows shaped like task rows. */
export function SkeletonList({ rows = 5, avatar = false }: { rows?: number; avatar?: boolean }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.skeletonList}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton width={22} height={22} radius={11} />
          <View style={styles.skeletonBody}>
            <Skeleton width={i % 2 === 0 ? '70%' : '55%'} height={16} />
            <Skeleton width="40%" height={12} />
          </View>
          {avatar ? <Skeleton width={26} height={26} radius={13} /> : null}
        </View>
      ))}
    </Animated.View>
  );
}

/** Placeholder cards for the projects list. */
export function SkeletonCards({ count = 3 }: { count?: number }) {
  const theme = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.skeletonList}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.skeletonCard, { borderColor: theme.border }]}>
          <View style={styles.skeletonRow}>
            <Skeleton width={40} height={40} radius={10} />
            <View style={styles.skeletonBody}>
              <Skeleton width="60%" height={17} />
              <Skeleton width="45%" height={12} />
            </View>
          </View>
          <Skeleton height={6} radius={3} />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  checkbox: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  skeletonList: { gap: 4 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 12 },
  skeletonBody: { flex: 1, gap: 8 },
  skeletonCard: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.two, marginBottom: Spacing.three },
});
