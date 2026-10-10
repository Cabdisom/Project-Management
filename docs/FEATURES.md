# Proposed features

Date: 2026-10-10
Based on `RESEARCH.md` and `MOBILE_APP_RESEARCH.md`. UI mockup:
https://claude.ai/artifact/EtR2P6JYLkuz1dKMiHCWGS (private until shared).

Decisions so far: iOS team, no Apple Developer account yet, one codebase
with Expo (web first, native iPhone app later).

## Version 1: what we build first

### Workspace and people
- Sign in with email (magic link) and Apple sign-in later.
- One workspace for the team. Invite by email link.
- Roles: owner, admin, member, guest (guest sees only projects they are in).

### My Tasks (home screen)
- Everything assigned to me across all projects.
- Grouped: Overdue, Today, Tomorrow, Later. Tabs: Today, Upcoming, All.
- Tap the circle to complete. Swipe for snooze or reschedule.

### Inbox
- One place for everything that needs me: assigned, mentioned, due today,
  comments on my tasks.
- Filters: All, Mentions, Assigned, Snoozed.
- Swipe right to mark done, swipe left to snooze. Mark all read.

### Quick add
- One tap from any screen. Type naturally: "Call Nile tomorrow 3pm #client
  !high" sets date, project, and priority.
- Chips show what was understood. Tap a chip to change it.

### Projects
- Project list with colour, progress, members, due date.
- Board view (columns = status, swipe between them) and list view.
- Per-project statuses, default: To do, In Progress, Review, Done.
- Drag a card to change status. Reorder inside a column.

### Tasks
- Title, description, assignee, due date and time, priority (Urgent, High,
  Medium, Low), labels, subtasks with progress, attachments, comments.
- Comments support @mentions, which create an Inbox item.
- Activity history on each task (who changed what, when).

### Notifications
- Push notification for assigned, mentioned, due soon, comment on my task.
- Each notification opens the exact task.
- Quiet hours.

### Search
- Search tasks, projects, and people. Result opens the item directly.

### Works everywhere
- Web app for computers. Add to home screen on iPhone. Native iPhone app
  once the Apple account exists.
- Works offline: read everything, make changes, sync when back online.
- Dark mode follows the phone setting.

## Version 2: after the team is using it
- Calendar view and timeline.
- Recurring tasks.
- Task dependencies (blocked by).
- Project templates.
- Time tracking.
- File previews in-app.
- Weekly summary email.
- Export to CSV.

## Not planned
- Sprints, story points, velocity charts.
- Gantt charts, budgets, portfolios.
- Client portals, invoicing.
- AI features, until there is a clear need.

## Screens in the mockup
1. My Tasks: personal list grouped by day.
2. Inbox: notifications with swipe actions.
3. Projects: list with progress.
4. Project board: one column fills the screen, swipe to the next.
5. Task detail: status, fields, subtasks, attachments, comments.
6. Quick add: bottom sheet with natural-language parsing.
7. Web app on a computer: sidebar plus four-column board.
