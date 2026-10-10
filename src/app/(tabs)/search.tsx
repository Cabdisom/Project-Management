import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TaskRow } from '@/components/task-row';
import { Empty, Field, Loading, Screen, SectionHeader } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useSearch } from '@/lib/queries';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [q, setQ] = useState('');
  const { data, isFetching } = useSearch(q);
  const active = q.trim().length >= 2;

  return (
    <Screen title="Search" headerBottom={<Field placeholder="Search tasks and projects" value={q} onChangeText={setQ} autoFocus autoCorrect={false} returnKeyType="search" />}>
      {!active ? (
        <Empty icon="search" title="Find anything" body="Type at least two letters to search task titles and project names." />
      ) : isFetching && !data ? (
        <Loading />
      ) : !data || (data.tasks.length === 0 && data.projects.length === 0) ? (
        <Empty icon="search" title="No results" body={`Nothing matches "${q.trim()}".`} />
      ) : (
        <>
          {data.projects.length > 0 ? (
            <>
              <SectionHeader title="Projects" count={data.projects.length} />
              {data.projects.map((p) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/project/[id]', params: { id: p.id } })}
                  style={({ pressed }) => [styles.projectRow, { borderBottomColor: theme.border, opacity: pressed ? 0.7 : 1 }]}>
                  <View style={[styles.swatch, { backgroundColor: p.color }]} />
                  <Text style={[styles.projectName, { color: theme.text }]}>{p.name}</Text>
                </Pressable>
              ))}
            </>
          ) : null}
          {data.tasks.length > 0 ? (
            <>
              <SectionHeader title="Tasks" count={data.tasks.length} />
              {data.tasks.map((t, i) => (
                <TaskRow key={t.id} task={t} showAssignee last={i === data.tasks.length - 1} />
              ))}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth },
  swatch: { width: 24, height: 24, borderRadius: 6 },
  projectName: { fontSize: 16, fontWeight: '500' },
});
