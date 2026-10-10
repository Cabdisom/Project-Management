import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const theme = useTheme();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setNotice(null);
    const e = email.trim().toLowerCase();
    if (!e || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (mode === 'up' && password.length < 8) {
      setError('Use at least 8 characters for the password.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'in') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: e, password });
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.auth.signUp({ email: e, password, options: { data: { full_name: name.trim() || undefined } } });
        if (err) throw err;
        if (!data.session) setNotice('Check your email to confirm your account, then sign in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll={false} padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.wrap}>
          <View style={styles.brand}>
            <View style={[styles.logo, { backgroundColor: theme.accent }]}>
              <Text style={styles.logoText}>PM</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{mode === 'in' ? 'Welcome back' : 'Create your account'}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {mode === 'in' ? 'Sign in to see your tasks.' : 'Takes less than a minute.'}
            </Text>
          </View>

          <View style={styles.form}>
            {mode === 'up' ? <Field label="Your name" placeholder="Ahmed Mahmoud" value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" /> : null}
            <Field label="Email" placeholder="you@company.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" autoComplete="email" />
            <Field
              label="Password"
              placeholder={mode === 'up' ? 'At least 8 characters' : 'Your password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType={mode === 'up' ? 'newPassword' : 'password'}
              onSubmitEditing={submit}
              returnKeyType="go"
            />
            <ErrorText>{error}</ErrorText>
            {notice ? <Text style={[styles.notice, { color: theme.success }]}>{notice}</Text> : null}
            <Button title={mode === 'in' ? 'Sign in' : 'Create account'} onPress={submit} loading={busy} style={styles.submit} />
          </View>

          <Pressable accessibilityRole="button" onPress={() => { setMode(mode === 'in' ? 'up' : 'in'); setError(null); setNotice(null); }} style={styles.switch}>
            <Text style={{ color: theme.textSecondary }}>
              {mode === 'in' ? 'New here? ' : 'Already have an account? '}
              <Text style={{ color: theme.accent, fontWeight: '600' }}>{mode === 'in' ? 'Create an account' : 'Sign in'}</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.five, width: '100%', maxWidth: 440, alignSelf: 'center' },
  brand: { alignItems: 'center', gap: Spacing.two },
  logo: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  logoText: { color: '#FFFFFF', fontWeight: '800', fontSize: 22, letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 15 },
  form: { gap: Spacing.three },
  submit: { marginTop: Spacing.one },
  notice: { fontSize: 14 },
  switch: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
});
