# Mobile App Research: App Store and Google Play

Date: 2026-10-10
Companion to `RESEARCH.md`.

How this was gathered: the store pages themselves are blocked from the
research environment, so the numbers below come from search-engine snapshots
of the official Google Play and App Store listings, plus aggregator sites.
Snapshots can be days to months old and differ by country. Treat every rating
as approximate and re-check the live store page before quoting it.

---

## 1. Ratings at a glance

Sorted by Google Play rating. Google Play is usually the harsher store, so it
is the better signal of real-world quality.

| App | Google Play | Reviews | App Store (US) | Ratings | Gap |
| --- | --- | --- | --- | --- | --- |
| monday.com | 4.7 | ~45K | 4.8 | ~48K | small |
| Notion | 4.6 | ~398K | 4.8 | ~90K | small |
| Todoist | 4.6 | ~306K | 4.9 | small sample | small |
| TickTick | 4.6 | ~164K | 4.9 | ~46K | small |
| Linear | 4.6 | ~1.3K | 4.8 | ~2.2K | small |
| Basecamp | 4.6 | ~26K | 4.7 | ~21K | small |
| Jira Cloud | 4.4 to 4.6 | ~54K | 4.7 | ~40K | small |
| Asana | 3.9 to 4.2 | ~45K | 4.7 | ~16K | large |
| ClickUp | 4.0 | ~20K | 4.7 | ~10K | large |
| Trello | 3.8 to 3.9 | ~123K | 4.3 to 4.4 | ~7K | large |

What stands out:

- **Trello, Asana, and ClickUp score much worse on Android than iOS.** All
  three are big web products whose mobile apps lag behind. That gap is a
  recurring complaint and an opening.
- **Personal task apps (Todoist, TickTick) are the best rated.** They are
  mobile-first, do one thing, and work offline.
- **Linear has tiny review counts.** Its mobile app is a companion, not the
  main product. The engineering market mostly lives on desktop.
- **Notion has by far the most Android reviews** at roughly 400K, showing how
  large the "docs plus tasks" audience is.
- **Basecamp's rating is sliding.** Reviews from May and June 2026 are
  strongly negative after the Basecamp 5 redesign (random project order, no
  scrollable project list, harder grid and calendar).

## 2. What each app does on mobile

| App | Mobile home screen | Core mobile features | Mobile-only limits |
| --- | --- | --- | --- |
| Trello | Boards list, then a board with swipeable columns | Cards, checklists, labels, due dates, attachments, Butler automations | Weak reminders, lag vs web, description formatting differs from web |
| Asana | Home, My Tasks, Inbox, Search, Account tabs | Tasks, projects, list and board views, comments, approvals, some automation | Cannot create a team, cannot deactivate account, conversations hard to find, no cold-start offline |
| monday.com | Boards and "My Work" | Kanban, timeline, charts views, updates, notifications | Dashboards and workspace setup need desktop; 3-seat minimum complained about |
| ClickUp | Home, Inbox, Search, Docs, Tasks | Tasks, docs, chat, AI, multiple views | Cluttered, slow to load, crashes, poor iPad support, recurring task bugs |
| Notion | Pages and Home tabs, recent pages | Pages, databases, tasks, AI, templates | No offline mode (most-requested feature), workspace settings need desktop, AI pushed into UI |
| Jira Cloud | Home with starred boards and recent issues | Boards, backlog, issues, transitions, comments, notifications | Missing fields vs web, freezes and blank pages, notification problems |
| Linear | Home (My Issues, favorites, teams), Inbox, Search | Triage, status updates, inbox swipe and snooze, Priority inbox (Sep 2026), document editing | No full offline on iOS per reviews, search buried in menus, titles truncated |
| Basecamp | Hey! (inbox), Home, Activity, Me | Message boards, to-dos, schedule, docs, campfire chat, pings | Post-redesign navigation confusion, missing notifications |
| Todoist | Today, Upcoming, Browse, Search | Natural-language quick add, projects, labels, filters, calendar | Few team features, slower cold start historically |
| TickTick | Tasks, Calendar, Pomodoro, Habits | To-do lists, calendar, reminders, habit tracker, focus timer | Limited calendar, settings hard to find, subscription complaints |

## 3. UI patterns that work on mobile

Consistent across the top-rated apps and the help docs of mid-tier ones:

1. **Bottom tab bar, 4 or 5 tabs.** The common set is Home, My Tasks (or
   Inbox), Search, Notifications, Account. Everything else is reached from
   those.
2. **A personal view first.** "My Tasks", "My Work", "My Issues", "Today".
   People open the phone app to see what they owe, not to browse projects.
3. **Inbox with swipe actions.** Linear's swipe-to-archive and snooze is the
   most praised mobile interaction in any of the reviews.
4. **Board view = horizontal swipe between columns.** One column fills the
   screen. Press-and-hold to drag a card to another column.
5. **Quick add button always visible.** A floating plus or a bottom bar
   button. Todoist's natural-language entry ("tomorrow 3pm #marketing") is
   repeatedly praised.
6. **Task detail as a full-screen sheet** with title, status, assignee, due
   date, description, then comments. Not a cramped card.
7. **Push notifications that deep-link** to the exact task or comment.
   Broken notifications are one of the top three complaints for Jira,
   Basecamp, and Trello.

## 4. Top complaints across all apps

Ranked by how often they appear.

1. **Feature gaps vs the web app.** "Compared to the website the app is very
   lacking." Appears for Jira, Asana, ClickUp, Linear, monday, Notion.
2. **Crashes and freezes.** ClickUp, monday (Android), Jira, Trello desktop.
3. **No or weak offline mode.** Notion (most requested), Asana, Linear iOS,
   Trello.
4. **Slow loading.** ClickUp, Trello, Todoist historically.
5. **Notifications unreliable.** Jira, Basecamp, Trello.
6. **Confusing navigation after redesigns.** Basecamp 5, Linear search.
7. **Pricing friction surfaced in-app.** Seat minimums (monday, Asana),
   subscription pushes (TickTick), AI features forced into the UI (Notion).
8. **Tablet support poor.** ClickUp iPad, Notion Mail iPad.

## 5. What this means for our app

- **Mobile is where the big players are weakest.** Trello, Asana, and
  ClickUp all sit around 4.0 on Android. A mobile app that is fast, stable,
  and works offline beats them on their worst surface.
- **Build the phone app around "me", not "projects".** My Tasks and Inbox
  are the two screens that matter. Project browsing is secondary.
- **Offline-first pays off twice.** It is the most requested missing feature
  and it also removes the "slow loading" complaint. This strengthens the case
  in `RESEARCH.md` for a sync-engine architecture, at least for mobile.
- **Keep feature parity honest.** Decide which features are mobile and which
  are desktop-only, and say so in the app rather than hiding them.
- **Notifications must deep-link and must be reliable.** This is table
  stakes and still broken in apps with 50K reviews.
- **Do not push upsells or AI into the core flow.** Notion and TickTick lose
  stars for it.
- **Ship a simple bottom bar: Home, My Tasks, Inbox, Search, Profile.** Quick
  add always one tap away.

## 6. Open questions for you

1. Is the phone app a first-class product or a companion to the web app?
   Linear treats it as a companion; Todoist treats it as the product.
2. Native (Swift and Kotlin), cross-platform (React Native or Flutter), or a
   responsive web app first? Offline-first is easiest in native or React
   Native with a sync engine.
3. Which store do we launch on first? Android is the harsher audience and
   the bigger one for most of these apps.

## 7. Sources

Store listings (via search snapshots)
- [Asana on Google Play](https://play.google.com/store/apps/details?id=com.asana.app&hl=en)
- [Asana on the App Store](https://apps.apple.com/us/app/asana-work-in-one-place/id489969512)
- [Trello on Google Play](https://play.google.com/store/apps/details?id=com.trello&hl=en_US)
- [Trello on the App Store](https://apps.apple.com/us/app/trello-organize-anything/id461504587)
- [monday.com on Google Play](https://play.google.com/store/apps/details?id=com.monday.monday&hl=en_CA)
- [monday.com on the App Store](https://apps.apple.com/us/app/monday-com-work-management/id1290128888)
- [ClickUp on Google Play](https://play.google.com/store/apps/details?id=co.mangotechnologies.clickup&hl=en_US)
- [ClickUp on the App Store](https://apps.apple.com/us/app/clickup-tasks-chat-docs-ai/id1535098836)
- [Notion on Google Play](https://play.google.com/store/apps/details?id=notion.id&hl=en_CA)
- [Notion on the App Store](https://apps.apple.com/us/app/notion-notes-tasks-ai/id1232780281)
- [Jira Cloud on Google Play](https://play.google.com/store/apps/details?id=com.atlassian.android.jira.core&hl=en_NZ)
- [Jira Cloud on the App Store](https://apps.apple.com/us/app/jira-cloud-by-atlassian/id1006972087)
- [Linear on Google Play](https://play.google.com/store/apps/details?id=app.linear)
- [Linear Mobile on the App Store](https://apps.apple.com/us/app/linear-mobile/id1645587184)
- [Basecamp on Google Play](https://play.google.com/store/apps/details?id=com.basecamp.bc3&hl=en)
- [Basecamp on the App Store](https://apps.apple.com/us/app/basecamp-project-management/id1015603248)
- [Todoist on Google Play](https://play.google.com/store/apps/details?id=com.todoist&hl=en_CA)
- [Todoist on the App Store](https://apps.apple.com/ee/app/todoist-to-do-list-calendar/id572688855)
- [TickTick on Google Play](https://play.google.com/store/apps/details?id=com.ticktick.task&hl=en_US)
- [TickTick on the App Store](https://apps.apple.com/us/app/ticktick-to-do-list-calendar/id626144601)

Reviews and comparisons
- [ClickUp reviews on Capterra](https://capterra.com/p/158833/ClickUp/reviews/)
- [ClickUp reviews on Trustpilot](https://uk.trustpilot.com/review/clickup.com?page=4)
- [Linear Mobile reviews (JustUseApp)](https://justuseapp.com/en/app/1645587184/linear-mobile/reviews)
- [Trello vs Asana vs ClickUp vs Notion (SaaSworthy)](https://www.saasworthy.com/compare/trello-vs-asana-vs-clickup-vs-notion-so?pIds=146,1605,1610,2556)
- [Asana vs Trello (Digital Project Manager)](https://thedigitalprojectmanager.com/tools/asana-vs-trello/)
- [Asana vs Linear (eesel)](https://www.eesel.ai/blog/asana-vs-linear)
- [Trello vs Asana (Plaky)](https://plaky.com/blog/trello-vs-asana/)
- [Best iOS project management apps (ClickUp)](https://clickup.com/blog/ios-project-management-apps/)
- [Mobile PM apps for client work (Teamwork)](https://www.teamwork.com/blog/mobile-app-project-management/)
- [Best PM apps for iPhone (GetApp)](https://www.getapp.com/project-management-planning-software/project-management/os/iphone/)

Official docs and changelogs
- [Linear: get the app](https://linear.app/docs/get-the-app.md)
- [Linear: Inbox](https://linear.app/docs/inbox)
- [Linear: Priority inbox (Sep 2026)](https://linear.app/changelog/2026-09-03-priority-inbox)
- [Linear: Introducing Linear Mobile](https://linear.app/changelog/2024-09-19-introducing-linear-mobile)
- [Quire mobile navigation](https://quire.io/guide/mobile-app-navigation)
- [Teamwork mobile boards](https://support.teamwork.com/projects/mobile-apps/working-with-your-projects-mobile)
- [Taskade mobile optimization](https://docs.taskade.com/docs/core-features/mobile-optimization)
