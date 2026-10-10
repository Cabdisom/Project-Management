import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/* ---------- Layout ---------- */

type ScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean | string;
  right?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  footer?: ReactNode;
  headerBottom?: ReactNode;
};

export function Screen({ children, title, subtitle, back, right, scroll = true, padded = true, footer, headerBottom }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= MaxContentWidth + 80;

  const header = (title || back || right) && (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.two, borderBottomColor: theme.border }]}>
      <View style={styles.headerRow}>
        {back ? (
          <IconButton
            name="back"
            label="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace(typeof back === 'string' ? back : '/'))}
          />
        ) : null}
        <View style={styles.headerTitles}>
          {title ? (
            <Text numberOfLines={1} style={[back ? styles.titleSmall : styles.title, { color: theme.text }]}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text numberOfLines={1} style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View style={styles.headerRight}>{right}</View> : null}
      </View>
      {headerBottom}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padded && styles.padded, { paddingBottom: insets.bottom + 100 }]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded]}>{children}</View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <View style={[styles.flex, wide && styles.wideInner]}>
        {header}
        {body}
        {footer}
      </View>
    </View>
  );
}

export function Row({ children, style, gap = Spacing.two }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[styles.row, { gap }, style]}>{children}</View>;
}

export function Spacer({ h = Spacing.three }: { h?: number }) {
  return <View style={{ height: h }} />;
}

export function Loading({ label }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.accent} />
      {label ? <Text style={[styles.muted, { color: theme.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

export function Empty({ icon = 'tasks', title, body, action }: { icon?: IconName; title: string; body?: string; action?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
        <Icon name={icon} size={28} color={theme.textFaint} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{title}</Text>
      {body ? <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>{body}</Text> : null}
      {action}
    </View>
  );
}

export function SectionHeader({ title, count, color, right }: { title: string; count?: number; color?: string; right?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: color ?? theme.textSecondary }]}>{title}</Text>
      {typeof count === 'number' ? (
        <View style={[styles.countPill, { backgroundColor: color ? `${color}22` : theme.surface }]}>
          <Text style={[styles.countText, { color: color ?? theme.textSecondary }]}>{count}</Text>
        </View>
      ) : null}
      <View style={styles.flex} />
      {right}
    </View>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  const theme = useTheme();
  if (!children) return null;
  return <Text style={[styles.error, { color: theme.danger }]}>{children}</Text>;
}

/* ---------- Controls ---------- */

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  loading?: boolean;
  small?: boolean;
};

export function Button({ title, variant = 'primary', icon, loading, small, style, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const bg =
    variant === 'primary' ? theme.accent : variant === 'secondary' ? theme.surface : variant === 'danger' ? theme.dangerSoft : 'transparent';
  const fg = variant === 'primary' ? theme.onAccent : variant === 'danger' ? theme.danger : variant === 'ghost' ? theme.accent : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        style as StyleProp<ViewStyle>,
      ]}
      {...rest}>
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={small ? 16 : 18} color={fg} /> : null}
      <Text style={[styles.buttonText, small && styles.buttonTextSmall, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ name, label, onPress, color, size = 22, style }: { name: IconName; label: string; onPress?: () => void; color?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }, style]}>
      <Icon name={name} size={size} color={color ?? theme.text} />
    </Pressable>
  );
}

export function Chip({
  label,
  icon,
  color,
  background,
  onPress,
  selected,
  dot,
  dashed,
}: {
  label: string;
  icon?: IconName;
  color?: string;
  background?: string;
  onPress?: () => void;
  selected?: boolean;
  dot?: string;
  dashed?: boolean;
}) {
  const theme = useTheme();
  const fg = color ?? (selected ? theme.onAccent : theme.textSecondary);
  const bg = background ?? (selected ? theme.accent : theme.surface);
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: dashed ? 'transparent' : bg, opacity: pressed ? 0.7 : 1 },
        dashed && { borderWidth: 1, borderStyle: 'dashed', borderColor: theme.border },
      ]}>
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: theme.surface }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && { backgroundColor: theme.background, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }]}>
            <Text style={[styles.segmentText, { color: active ? theme.text : theme.textSecondary, fontWeight: active ? '600' : '500' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ label, style, inputStyle, ...rest }: TextInputProps & { label?: string; inputStyle?: StyleProp<TextStyle> }) {
  const theme = useTheme();
  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.textFaint}
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text }, inputStyle]}
        {...rest}
      />
    </View>
  );
}

export function ListRow({ children, onPress, style, last }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; last?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.listRow, { borderBottomColor: theme.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, opacity: pressed ? 0.7 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.background, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

export function ProgressBar({ value, color, height = 6 }: { value: number; color: string; height?: number }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ now: pct, min: 0, max: 100 }} style={[styles.progress, { height, borderRadius: height / 2, backgroundColor: theme.surface }]}>
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}

export const ui = StyleSheet.create({
  h1: { fontSize: 30, fontWeight: '700', letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2, lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  small: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '600' },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wideInner: { alignSelf: 'center', width: '100%', maxWidth: MaxContentWidth + 40 },
  header: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two, gap: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 44 },
  headerTitles: { flex: 1, gap: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.4 },
  titleSmall: { fontSize: 17, fontWeight: '600' },
  subtitle: { fontSize: 13 },
  padded: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.five },
  muted: { fontSize: 14 },
  empty: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six, paddingHorizontal: Spacing.four },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.one },
  emptyTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.four, marginBottom: Spacing.one },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  countPill: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
  countText: { fontSize: 12, fontWeight: '600' },
  error: { fontSize: 14, marginTop: Spacing.two },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, minHeight: 48, paddingHorizontal: Spacing.four, borderRadius: Radius.md },
  buttonSmall: { minHeight: 36, paddingHorizontal: Spacing.three, borderRadius: Radius.sm },
  buttonText: { fontSize: 16, fontWeight: '600' },
  buttonTextSmall: { fontSize: 14 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 34, paddingHorizontal: 12, borderRadius: Radius.pill },
  chipText: { fontSize: 13, fontWeight: '600' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  segmented: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 2 },
  segment: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  segmentText: { fontSize: 14 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },
  input: { minHeight: 48, borderRadius: Radius.md, paddingHorizontal: Spacing.three, fontSize: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 12, minHeight: 56 },
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.two },
  progress: { overflow: 'hidden', width: '100%' },
});
