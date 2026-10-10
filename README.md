# Project Management

A simple, fast project management app for small teams. One codebase runs on
iPhone, Android and the web (Expo + React Native), with Supabase as the
backend.

Research, feature list and decisions are in `docs/`.

## What it does

- **My Tasks**: everything assigned to you, grouped by Overdue, Today, Tomorrow, Later.
- **Inbox**: assignments, comments and due reminders. Snooze or mark read.
- **Quick add**: type "Call Nile tomorrow 3pm #client !high" and the date, project and priority are filled in.
- **Projects**: board view (columns by status) and list view.
- **Tasks**: description, assignee, due date, priority, subtasks, comments, history.
- **Team**: workspaces, roles, invite links.
- Live updates between devices. Dark mode.

## Run it

```bash
npm install
cp .env.example .env   # add your Supabase URL and publishable key
npx expo start --web   # open http://localhost:8081
npx expo start         # scan the QR code with Expo Go on your phone
```

The database schema is in `supabase/migrations`. Apply it to a Supabase project
before first use (see `supabase/README.md`).

## Checks

```bash
npx tsc --noEmit
npx expo lint
```

## Layout

```
src/app/            screens (Expo Router)
  (tabs)/           My Tasks, Inbox, Projects, Search
  task/[id].tsx     task detail
  project/[id].tsx  project board and list
  new-task.tsx      quick add
  settings.tsx      profile, workspace, members, invites
src/components/     shared UI
src/lib/            Supabase client, auth, queries, realtime, task parser
supabase/           database migrations
docs/               research and product docs
```
