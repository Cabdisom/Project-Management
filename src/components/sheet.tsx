import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { haptic } from '@/components/motion';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SheetOption<T extends string = string> = {
  value: T;
  label: string;
  sublabel?: string;
  icon?: IconName;
  color?: string;
  dot?: string;
  destructive?: boolean;
  selected?: boolean;
};

type Props<T extends string> = {
  visible: boolean;
  title?: string;
  options: SheetOption<T>[];
  onSelect: (value: T) => void;
  onClose: () => void;
};

/** Bottom sheet with a list of choices. Slides up on phone and web. */
export function OptionSheet<T extends string>({ visible, title, options, onSelect, onClose }: Props<T>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(140)} style={styles.backdrop}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={styles.flex} />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(220)}
        exiting={SlideOutDown.duration(180)}
        style={[styles.sheet, { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={[styles.handle, { backgroundColor: theme.border }]} />
        {title ? (
          <Text numberOfLines={2} style={[styles.title, { color: theme.textSecondary }]}>
            {title}
          </Text>
        ) : null}
        <ScrollView style={styles.list} bounces={false}>
          {options.map((o) => (
            <Pressable
              key={o.value}
              accessibilityRole="button"
              onPress={() => {
                haptic('light');
                onSelect(o.value);
                onClose();
              }}
              style={({ pressed }) => [styles.option, { backgroundColor: pressed ? theme.surface : 'transparent' }]}>
              {o.dot ? <View style={[styles.dot, { backgroundColor: o.dot }]} /> : null}
              {o.icon ? <Icon name={o.icon} size={20} color={o.color ?? (o.destructive ? theme.danger : theme.textSecondary)} /> : null}
              <View style={styles.optionText}>
                <Text style={[styles.label, { color: o.destructive ? theme.danger : (o.color ?? theme.text) }]}>{o.label}</Text>
                {o.sublabel ? <Text style={[styles.sublabel, { color: theme.textSecondary }]}>{o.sublabel}</Text> : null}
              </View>
              {o.selected ? <Icon name="check" size={18} color={theme.accent} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17,24,39,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
  },
  handle: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: Spacing.two },
  title: { fontSize: 13, fontWeight: '600', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, textTransform: 'uppercase', letterSpacing: 0.4 },
  list: { flexGrow: 0 },
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 52, paddingHorizontal: Spacing.three, borderRadius: Radius.md },
  optionText: { flex: 1 },
  label: { fontSize: 16, fontWeight: '500' },
  sublabel: { fontSize: 13 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
