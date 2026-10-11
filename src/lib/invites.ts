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
  const configured = process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, '');
  if (configured) return `${configured}/invite/${token}`;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/invite/${token}`;
  }
  return `https://your-app-url/invite/${token}`;
}
