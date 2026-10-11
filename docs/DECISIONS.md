# Decision log

Short record of product and technical decisions, newest first.

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
