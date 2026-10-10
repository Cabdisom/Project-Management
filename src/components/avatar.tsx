import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  name?: string | null;
  color?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, color, size = 32, style }: Props) {
  return (
    <View
      accessibilityLabel={name ?? 'Unassigned'}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color ?? '#6B7280' },
        style,
      ]}>
      <Text style={[styles.text, { fontSize: Math.round(size * 0.38) }]}>{initials(name)}</Text>
    </View>
  );
}

export function AvatarStack({ people, size = 28 }: { people: { name?: string | null; color?: string | null }[]; size?: number }) {
  const shown = people.slice(0, 3);
  const extra = people.length - shown.length;
  return (
    <View style={styles.stack}>
      {shown.map((p, i) => (
        <Avatar key={i} name={p.name} color={p.color} size={size} style={[styles.stacked, i > 0 && { marginLeft: -size * 0.3 }]} />
      ))}
      {extra > 0 && (
        <View style={[styles.base, styles.stacked, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#E5E7EB', marginLeft: -size * 0.3 }]}>
          <Text style={[styles.text, { color: '#374151', fontSize: Math.round(size * 0.36) }]}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontWeight: '600' },
  stack: { flexDirection: 'row', alignItems: 'center' },
  stacked: { borderWidth: 2, borderColor: '#FFFFFF' },
});
