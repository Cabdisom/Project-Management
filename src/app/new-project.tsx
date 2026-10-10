import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, ErrorText, Field, IconButton, Screen } from '@/components/ui';
import { ProjectColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateProject } from '@/lib/queries';

export default function NewProjectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(ProjectColors[0]);
  const create = useCreateProject();

  const close = () => (router.canGoBack() ? router.back() : router.replace('/projects'));

  return (
    <Screen title="New project" right={<IconButton name="close" label="Cancel" onPress={close} />}>
      <View style={styles.form}>
        <Field label="Name" placeholder="Website redesign" value={name} onChangeText={setName} autoFocus autoCapitalize="sentences" />
        <Field label="Description (optional)" placeholder="What is this project about?" value={description} onChangeText={setDescription} multiline inputStyle={styles.multiline} />
        <View style={styles.colors}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Colour</Text>
          <View style={styles.swatches}>
            {ProjectColors.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="radio"
                accessibilityState={{ selected: c === color }}
                accessibilityLabel={`Colour ${c}`}
                onPress={() => setColor(c)}
                style={[styles.swatch, { backgroundColor: c, borderColor: c === color ? theme.text : 'transparent' }]}>
                {c === color ? <Icon name="check" size={18} color="#FFFFFF" weight="bold" /> : null}
              </Pressable>
            ))}
          </View>
        </View>
        <ErrorText>{create.error?.message}</ErrorText>
        <Button
          title="Create project"
          loading={create.isPending}
          disabled={!name.trim()}
          onPress={() =>
            create.mutate(
              { name: name.trim(), color, description: description.trim() || null },
              { onSuccess: (data) => router.replace({ pathname: '/project/[id]', params: { id: data.id } }) },
            )
          }
        />
        <Text style={[styles.note, { color: theme.textFaint }]}>Every project starts with four columns: To do, In progress, Review, Done.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.four, maxWidth: 480, width: '100%', alignSelf: 'center' },
  multiline: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
  colors: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 44, height: 44, borderRadius: 12, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  note: { fontSize: 13, textAlign: 'center' },
});
