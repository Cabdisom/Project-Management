# Decision log

Short record of product and technical decisions, newest first.

## 2026-10-11: Motion and feel, inspired by Things 3, Todoist and Linear

- Completion is a reward: the circle pops and fills, a haptic tap fires, and
  the row slides out after a short delay (Things 3 pattern).
- Swipe gestures on rows: task right = done, left = tomorrow; inbox right =
  clear, left = snooze (Todoist and Mail pattern).
- Lists stagger in, bottom sheets spring up, progress bars animate, buttons
  and cards shrink slightly on press, skeletons replace spinners.
- All motion lives in `src/components/motion.tsx` and uses Reanimated layout
  animations, so it works on web and native alike. Keep animations under
  250 ms so routine use never feels slower.

## 2026-10-11: Web app hosted on GitHub Pages

- Repo made public so GitHub Pages works on the free plan.
- Live at https://cabdisom.github.io/Project-Management/
- A GitHub Actions workflow builds and deploys on every push.

## 2026-10-11: Version 1 built and tested on web

- Stack: Expo SDK 57 with Expo Router, React Native, TypeScript, TanStack
  Query, Supabase (Postgres, Auth, Realtime).
- Supabase project `project-management` in eu-central-1 (Frankfurt).
- Native tabs on iOS and Android; standard tabs with a sidebar on web.
- Email and password sign-in. Supabase rejects some email domains at
  sign-up and sends a confirmation email by default.
- Two seeded test accounts exist in the database (Ahmed, Sara, password
  shared in chat). Remove them before real use.
- Not yet built: offline mode, push notifications, attachments upload,
  drag and drop on the board (use "Move to" on a card instead), labels
  editing, Apple sign-in.

## 2026-10-10: One codebase with Expo, web first

- No Apple Developer account yet, so the team uses the web app on their
  phones (add to home screen) until the native build ships.

## 2026-10-10: iOS is the first mobile platform

- The team all uses iOS. Android is not needed for the first release.

## 2026-10-10: Research phase complete

- `RESEARCH.md`: market, competitors, architecture, stack, data model.
- `MOBILE_APP_RESEARCH.md`: live App Store and Google Play data, UI review.
- `FEATURES.md`: proposed features. UI mockup: https://claude.ai/artifact/EtR2P6JYLkuz1dKMiHCWGS
