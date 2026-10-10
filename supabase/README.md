# Database

The app uses a Supabase project (Postgres, Auth, Realtime).

- `migrations/0001_initial_schema.sql`: tables, triggers, row level security, realtime.
- `migrations/0002_workspace_creator_select.sql`: policy fix for creating a workspace.

Apply them in order with the Supabase SQL editor or the Supabase CLI
(`supabase db push`). The app's connection settings live in `.env`
(`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`). The publishable key
is safe to ship; access is enforced by row level security.

## Model

- `workspaces` and `workspace_members` (roles: owner, admin, member, guest)
- `invites` (one-time tokens, accepted via the `accept_invite` function)
- `projects` with per-project `project_statuses` (default: To do, In progress, Review, Done)
- `tasks` with `subtasks`, `comments`, `attachments`, `task_labels`
- `activity` (history) and `notifications` (inbox), written by triggers
- `profiles`, created automatically for each auth user

Every workspace-owned row carries `workspace_id`; the `is_member` and
`is_admin` functions back the security policies.
