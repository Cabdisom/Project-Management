import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AvatarStack } from '@/components/avatar';
import { Fab } from '@/components/fab';
import { SkeletonCards } from '@/components/motion';
import { Button, Card, Empty, IconButton, ProgressBar, Screen, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatShortDate } from '@/lib/dates';
import { useProjects } from '@/lib/queries';

export default function ProjectsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useProjects();

  return (
    <>
      <Screen title="Projects" refreshing={isRefetching} onRefresh={refetch} right={<IconButton name="plus" label="New project" onPress={() => router.push('/new-project')} />}>
        {isLoading ? (
          <SkeletonCards />
        ) : !data || data.length === 0 ? (
          <Empty
            icon="projectsFilled"
            title="No projects yet"
            body="A project groups related tasks and gives them a board."
            action={<Button title="Create a project" icon="plus" onPress={() => router.push('/new-project')} />}
          />
        ) : (
          <>
            <SectionHeader title="Active" count={data.length} />
            <View style={styles.list}>
              {data.map((p, i) => {
                const pct = p.total === 0 ? 0 : p.done / p.total;
                const due = p.due_date ? formatShortDate(new Date(`${p.due_date}T00:00:00`)) : null;
                return (
                  <Animated.View key={p.id} entering={FadeInDown.duration(240).delay(i * 40)} layout={LinearTransition}>
                    <Card onPress={() => router.push({ pathname: '/project/[id]', params: { id: p.id } })} style={styles.card}>
                      <View style={[styles.stripe, { backgroundColor: p.color }]} />
                      <View style={styles.cardRow}>
                        <View style={[styles.swatch, { backgroundColor: p.color }]}>
                          <Text style={styles.swatchText}>{p.name.slice(0, 1).toUpperCase()}</Text>
                        </View>
                        <View style={styles.cardBody}>
                          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
                            {p.name}
                          </Text>
                          <Text numberOfLines={1} style={[styles.meta, { color: theme.textSecondary }]}>
                            {p.total === 0 ? 'No tasks yet' : `${p.done} of ${p.total} done`}
                            {due ? ` · Due ${due}` : ''}
                          </Text>
                        </View>
                        {p.people.length > 0 ? <AvatarStack people={p.people.map((x) => ({ name: x.full_name, color: x.avatar_color }))} /> : null}
                      </View>
                      <ProgressBar value={pct} color={p.color} />
                    </Card>
                  </Animated.View>
                );
              })}
            </View>
          </>
        )}
      </Screen>
      <Fab />
    </>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.three },
  card: { overflow: 'hidden', paddingLeft: Spacing.three + 6 },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  swatchText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  cardBody: { flex: 1, gap: 2, minWidth: 0 },
  name: { fontSize: 17, fontWeight: '600' },
  meta: { fontSize: 13 },
});
