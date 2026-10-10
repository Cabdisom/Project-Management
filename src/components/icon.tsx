import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

type SymbolName = Exclude<SymbolViewProps['name'], string>;
type AndroidName = NonNullable<SymbolName['android']>;

const ICONS = {
  tasks: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  tasksFilled: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  inbox: { ios: 'tray', android: 'inbox', web: 'inbox' },
  inboxFilled: { ios: 'tray.fill', android: 'inbox', web: 'inbox' },
  projects: { ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' },
  projectsFilled: { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  flag: { ios: 'flag.fill', android: 'flag', web: 'flag' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  forward: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  down: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  more: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  person: { ios: 'person', android: 'person', web: 'person' },
  personAdd: { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' },
  people: { ios: 'person.2', android: 'group', web: 'group' },
  attach: { ios: 'paperclip', android: 'attach_file', web: 'attach_file' },
  comment: { ios: 'bubble.left', android: 'chat_bubble', web: 'chat_bubble' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  label: { ios: 'tag', android: 'label', web: 'label' },
  send: { ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  link: { ios: 'link', android: 'link', web: 'link' },
  copy: { ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' },
  board: { ios: 'rectangle.split.3x1', android: 'view_kanban', web: 'view_kanban' },
  list: { ios: 'list.bullet', android: 'list', web: 'list' },
  circle: { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' },
  circleCheck: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  snooze: { ios: 'zzz', android: 'snooze', web: 'snooze' },
  archive: { ios: 'archivebox', android: 'archive', web: 'archive' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  folder: { ios: 'folder', android: 'folder', web: 'folder' },
  sparkle: { ios: 'wand.and.stars', android: 'auto_awesome', web: 'auto_awesome' },
} as const satisfies Record<string, { ios: string; android: AndroidName; web: AndroidName }>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolViewProps['weight'];
};

export function Icon({ name, size = 22, color, style, weight }: Props) {
  const def = ICONS[name];
  return (
    <SymbolView
      name={{ ios: def.ios as SymbolName['ios'], android: def.android, web: def.web }}
      size={size}
      tintColor={color}
      weight={weight}
      style={[{ width: size, height: size }, style]}
    />
  );
}
