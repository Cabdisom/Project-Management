import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'pm.pendingInvite';

export async function storePendingInvite(token: string) {
  await AsyncStorage.setItem(KEY, token);
}

export async function takePendingInvite(): Promise<string | null> {
  const token = await AsyncStorage.getItem(KEY);
  if (token) await AsyncStorage.removeItem(KEY);
  return token;
}

export function inviteUrl(token: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/invite/${token}`;
  }
  const base = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://your-app-url';
  return `${base}/invite/${token}`;
}
