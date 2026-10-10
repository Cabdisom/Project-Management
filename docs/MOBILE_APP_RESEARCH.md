# Mobile App Research: App Store and Google Play

Date: 2026-10-10 (live store data pulled this day)
Companion to `RESEARCH.md`.

How this was gathered: the official Google Play and App Store listing pages
for 10 apps were downloaded directly. Ratings, review counts, download
counts, star histograms, update dates, and the visible reviews were parsed
from those pages. Four Google Play screenshots per app were viewed to describe
the UI. Earlier search-snapshot numbers have been replaced with live ones.

---

## 1. Ratings at a glance (live, 2026-10-10)

| App | Play rating | Play reviews | Play installs | iOS rating | iOS ratings | Play last update |
| --- | --- | --- | --- | --- | --- | --- |
| monday.com | 4.7 | 45.3K | 5M+ | 4.8 | 48.2K | Oct 4, 2026 |
| Notion | 4.6 | 398K | 10M+ | 4.8 | 90.4K | Oct 2, 2026 |
| Todoist | 4.6 | 306K | 10M+ | 4.8 | 129.7K | Oct 8, 2026 |
| TickTick | 4.6 | 165K | 10M+ | 4.9 | 46.3K | Sep 24, 2026 |
| Linear | 4.6 | 1.3K | 100K+ | 4.8 | 2.2K | Oct 7, 2026 |
| Basecamp | 4.6 | 26.2K | 1M+ | 4.7 | 20.9K | Sep 29, 2026 |
| Jira Cloud | 4.3 | 54.4K | 1M+ | 4.7 | 40.7K | Oct 9, 2026 |
| ClickUp | 4.0 | 21.3K | 1M+ | 4.7 | 9.9K | Oct 2, 2026 |
| Asana | 3.9 | 45.5K | 5M+ | 4.7 | 15.7K | Oct 8, 2026 |
| Trello | 3.8 | 123K | 10M+ | 4.3 | 7.0K | Sep 30, 2026 |

### Star distribution on Google Play

The share of 1-star reviews is the clearest signal of real-world pain.

| App | 5-star share | 1-star share | Read as |
| --- | --- | --- | --- |
| monday.com | 87% | 6% | Loved, few angry users |
| TickTick | 82% | 5% | Loved |
| Linear | 82% | 7% | Loved by a small audience |
| Notion | 81% | 4% | Loved at huge scale |
| Todoist | 81% | 4% | Loved at huge scale |
| Basecamp | 81% | 5% | Loved, but May 2026 redesign is souring it |
| Jira Cloud | 74% | 10% | Mixed |
| ClickUp | 63% | 17% | Polarised |
| Asana | 59% | 20% | Polarised. One in five users gives 1 star |
| Trello | 51% | 18% | Polarised. Half the users are unhappy |

What stands out:

- **Trello, Asana, and ClickUp are polarised on Android.** Roughly one in
  five Android reviewers gives them 1 star. All three are big web products
  whose mobile apps lag behind.
- **The iOS gap is large for the same three.** Asana is 4.7 on iOS and 3.9
  on Android. Trello is 4.3 vs 3.8. ClickUp is 4.7 vs 4.0. Android quality
  is where they are losing.
- **Personal task apps (Todoist, TickTick) are the best rated at scale**,
  with 300K and 165K Android reviews and a 4 to 5 percent 1-star share.
- **Linear has tiny review counts** (1.3K Android, 2.2K iOS). Its mobile
  app is a companion. The engineering market lives on desktop.
- **Notion has by far the most Android reviews** at nearly 400K, showing
  how large the "docs plus tasks" audience is.
- **Everyone ships often.** Every app was updated within the last 16 days.
- **Basecamp's rating is sliding.** Reviews from May 2026 onward are
  strongly negative after the Basecamp 5 redesign.

## 2. What the screenshots show (UI)

Four store screenshots per app were reviewed. This is what each app chooses
to show first, which is what they think sells.

| App | Visual style | Bottom bar | First screen shown | Notable |
| --- | --- | --- | --- | --- |
| Trello | Bright blue, white cards | Boards, Inbox, Planner, Activity, Account | Inbox (card capture), then a calendar Planner | Pushes "Inbox" and "My work" over boards. Due-date notification with quick actions. |
| Asana | Rich colour per screen, white cards | Home, Inbox, My Tasks, Search, Account | Home with Recents and starred Projects | Inbox groups by project with "Relevant first". My Tasks grouped Top priority, Due today. |
| monday.com | Purple, colour-coded status pills | Not shown in screenshots | Board grouped by month with Done, Working on it, Stuck | "My work" with counts Past week, Today, This week, Later. Notification filters: All, Unread, Mentioned. |
| ClickUp | White, pastel tiles, AI prominent | Not shown | Home with Replies, Today, Assigned, Activity tiles | Search bar on every screen. Inbox with Primary count. Whole screen for AI chat. |
| Notion | Minimal black and white, emoji icons | Not shown | "Jump back in" recents plus page tree | Docs-first. Tasks appear only as database lists. |
| Jira Cloud | Illustrated marketing, little real UI | Not shown | Create issue form | Store page shows illustrations, not screens. Suggests the real UI is not a selling point. |
| Linear | Dark, dense, monochrome | Home, Inbox, Create, Cycles, Search | Sidebar with Favorites and Teams, then Inbox | Inbox swipe actions (Unread). Create issue with chips for Triage, Priority, Assignee, Label, Cycle. Push notification deep links. |
| Basecamp | Blue, card grid, friendly | Home, Hey!, Activity (3 round buttons) | Project grid with Activity, Calendar, Reports, Everything | Message boards, to-do lists, and card tables as separate tools. |
| Todoist | Warm pastels, red accent | Sidebar: Inbox, Today, Upcoming, Team projects | Voice capture and natural-language quick add | "every Monday +Maria" parsed from text. Calendar time-blocking view. |
| TickTick | Light blue, calendar heavy | Hamburger sidebar | Inbox grouped Today, Tomorrow | Calendar, Eisenhower priority matrix, AI voice add. |

Patterns across the screenshots:

1. **Everyone has an Inbox.** Trello, Asana, monday, ClickUp, Linear,
   Todoist, TickTick all put a notification or capture Inbox in the main
   navigation. It is the most common screen after the task list.
2. **"My work" beats "Projects".** Asana (My Tasks), monday (My work),
   Trello (My work), ClickUp (Today, Assigned) all lead with a personal view.
3. **Quick capture is a headline feature.** Todoist (voice plus natural
   language), TickTick (AI voice add), Linear (create issue with chips),
   Trello (Inbox capture).
4. **Status is shown as coloured pills**, not icons. monday is the extreme
   case. Asana and Linear use small coloured dots.
5. **Light theme with one brand colour** is the norm. Linear is the only
   dark-by-default app and it looks the most "pro".
6. **AI is being pushed into the main screen** by ClickUp and TickTick. The
   reviews below suggest users are not asking for it.

## 3. What recent reviews say (live, visible on store pages)

Direct from the Google Play listing pages, newest first where available.

**Trello**
- Jul 2026: "I've recently lost notes I had added in many cards and the
  Labels don't work."
- May 2026: search shows which board a card is in, but does not jump to it.
- Store page also shows reviewers using it as a personal notebook, not for
  teams.

**Asana**
- Jun 2026: after a phone upgrade "this app isn't as user-friendly", could
  no longer type directly into fields.
- May 2025: "won't maintain sorting by due date", subtask reordering moves
  the wrong item.
- Jun 2025: cancellation friction and a surprise discount offer at cancel.

**monday.com**
- Aug 2026: "calendar view doesn't let me see any details at all, only a
  dot."
- 2023: Android version "CONSTANTLY crashing" while desktop worked.
- "Only for teams. If you are on your own, don't waste your time."

**ClickUp**
- Apr 2026: endless login loop on Android.
- Nov 2025: "I really enjoy ClickUp desktop, but the app needs some serious
  work."
- 2022: could not link the mobile app to an existing account.

**Notion**
- Jul 2026: strongly positive, "they had me at hello".
- Feb 2026: line spacing bug when writing.
- Sep 2025: "superior alternative to most writing docs until the AI
  rebrand."

**Jira Cloud**
- Comment editor moves the cursor and inserts blank lines.
- "Compared to the website, the app is VERY lacking." Backlog missing.
- Notification taps lead to blank pages.

**Linear**
- Sep 2026: "cannot manually click and drag to reorder issues", Done
  issues disappear from every filter.
- Jul 2026: "finding simple things like search is always buried under
  unintuitive menus."
- Aug 2026: praised for simplicity and price versus competitors.

**Basecamp**
- May 26 and May 30, 2026: "Update is a mess", bookmarks gone, messaging
  hard to find, items marked "don't forget" lost.

**Todoist**
- Dec 2024: "I don't just use it every day, I rely on it every day."
- Reminders are paid-only, a long-standing complaint.

**TickTick**
- Aug and Sep 2026: "App is a joy to use", "all I need is my phone."
- Jul 2025: repeat and reminder settings hard to find.

## 4. Top complaints across all apps

Ranked by how often they appear in the live reviews and aggregator sites.

1. **Mobile missing features the web has.** Jira, Asana, ClickUp, Linear,
   monday, Notion.
2. **Crashes, freezes, login loops.** ClickUp, monday (Android), Jira.
3. **Data loss or sync bugs.** Trello notes lost, Basecamp items lost,
   Asana sort order lost.
4. **No or weak offline mode.** Notion (most requested), Asana, Linear.
5. **Search that does not deep-link.** Trello, Linear.
6. **Notifications that open blank pages.** Jira, Basecamp.
7. **Redesigns that hide things.** Basecamp 5, Linear navigation.
8. **Pricing friction in-app.** Seat minimums (monday), paid reminders
   (Todoist), AI pushed into the UI (Notion, ClickUp).
9. **Not useful for solo users.** monday.

## 5. What this means for our app

- **Android quality is the opening.** Trello, Asana, and ClickUp lose a
  full star on Android. A fast, stable Android app that never loses data
  beats them on their weakest surface.
- **Build the phone app around "me".** Inbox and My Tasks are the two
  screens every top app leads with. Project browsing is secondary.
- **Quick capture is a feature, not a button.** Natural-language entry like
  Todoist's ("Friday 13:00 p2 +Alex") is the most praised interaction in the
  whole set.
- **Offline-first removes two complaints at once.** It is the most
  requested missing feature and it also kills "slow loading" and "lost my
  notes". This strengthens the sync-engine case in `RESEARCH.md`.
- **Search and notifications must deep-link to the exact item.** Still
  broken in apps with 50K reviews.
- **Keep feature parity honest.** Show desktop-only features as such rather
  than hiding them.
- **Do not push AI or upsells into the core flow.** Notion and ClickUp lose
  stars for it.
- **Bottom bar: Home, My Tasks, Inbox, Search, Profile.** A create button
  always one tap away. Light theme with one accent colour, dark mode
  available.

## 6. Open questions for you

1. Is the phone app a first-class product or a companion to the web app?
   Todoist treats it as the product. Linear treats it as a companion.
2. Native (Swift and Kotlin), cross-platform (React Native or Flutter), or a
   responsive web app first? Offline-first is easiest in native or React
   Native with a sync engine.
3. Android first? It is the harsher audience and where the incumbents are
   weakest.

## 7. Sources

Store listings (downloaded 2026-10-10)
- [Asana on Google Play](https://play.google.com/store/apps/details?id=com.asana.app)
- [Asana on the App Store](https://apps.apple.com/us/app/id489969512)
- [Trello on Google Play](https://play.google.com/store/apps/details?id=com.trello)
- [Trello on the App Store](https://apps.apple.com/us/app/id461504587)
- [monday.com on Google Play](https://play.google.com/store/apps/details?id=com.monday.monday)
- [monday.com on the App Store](https://apps.apple.com/us/app/id1290128888)
- [ClickUp on Google Play](https://play.google.com/store/apps/details?id=co.mangotechnologies.clickup)
- [ClickUp on the App Store](https://apps.apple.com/us/app/id1535098836)
- [Notion on Google Play](https://play.google.com/store/apps/details?id=notion.id)
- [Notion on the App Store](https://apps.apple.com/us/app/id1232780281)
- [Jira Cloud on Google Play](https://play.google.com/store/apps/details?id=com.atlassian.android.jira.core)
- [Jira Cloud on the App Store](https://apps.apple.com/us/app/id1006972087)
- [Linear on Google Play](https://play.google.com/store/apps/details?id=app.linear)
- [Linear Mobile on the App Store](https://apps.apple.com/us/app/id1645587184)
- [Basecamp on Google Play](https://play.google.com/store/apps/details?id=com.basecamp.bc3)
- [Basecamp on the App Store](https://apps.apple.com/us/app/id1015603248)
- [Todoist on Google Play](https://play.google.com/store/apps/details?id=com.todoist)
- [Todoist on the App Store](https://apps.apple.com/us/app/id572688855)
- [TickTick on Google Play](https://play.google.com/store/apps/details?id=com.ticktick.task)
- [TickTick on the App Store](https://apps.apple.com/us/app/id626144601)

Reviews and comparisons
- [ClickUp reviews on Capterra](https://capterra.com/p/158833/ClickUp/reviews/)
- [ClickUp reviews on Trustpilot](https://uk.trustpilot.com/review/clickup.com?page=4)
- [Linear Mobile reviews (JustUseApp)](https://justuseapp.com/en/app/1645587184/linear-mobile/reviews)
- [Asana vs Trello (Digital Project Manager)](https://thedigitalprojectmanager.com/tools/asana-vs-trello/)
- [Asana vs Linear (eesel)](https://www.eesel.ai/blog/asana-vs-linear)
- [Best iOS project management apps (ClickUp)](https://clickup.com/blog/ios-project-management-apps/)
- [Mobile PM apps for client work (Teamwork)](https://www.teamwork.com/blog/mobile-app-project-management/)

Official docs and changelogs
- [Linear: get the app](https://linear.app/docs/get-the-app.md)
- [Linear: Inbox](https://linear.app/docs/inbox)
- [Linear: Priority inbox (Sep 2026)](https://linear.app/changelog/2026-09-03-priority-inbox)
- [Quire mobile navigation](https://quire.io/guide/mobile-app-navigation)
- [Teamwork mobile boards](https://support.teamwork.com/projects/mobile-apps/working-with-your-projects-mobile)
