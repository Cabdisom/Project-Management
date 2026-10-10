# Project Management App: Pre-Build Research

Date: 2026-10-10
Status: Research only. No product decisions locked in yet.

This document collects what we found before writing any code: the competitive
landscape, what users complain about, what open-source projects already exist,
the architecture patterns the best tools use, candidate tech stacks, a minimal
data model, and the questions we still need to answer.

Source quality note: most publicly available comparisons are vendor blogs or
SEO review sites. Prices and feature claims below are approximate and should be
re-checked on the vendors' own pages before any decision depends on them.

---

## 1. Market snapshot

Estimates vary a lot by research firm, but all of them agree the category is
large and still growing at double digits.

| Source | 2025 size | Forecast |
| --- | --- | --- |
| Fortune Business Insights | ~$11.9B | ~$45B by 2034 (~16% CAGR) |
| The Business Research Company | ~$9.1B | ~$10.5B in 2026 |
| Mordor Intelligence (via monday.com) | ~$7.2B | ~$12B by 2030 (~10.7% CAGR) |

Other points worth keeping in mind:

- Large enterprises still hold the majority of revenue, but SMEs are forecast
  to be the fastest-growing segment.
- Adoption is far from saturated. One survey puts dedicated PM software use at
  only about a quarter of organizations. Vendor surveys claim much higher
  numbers, so treat both with caution.
- Smaller businesses are reported to be more likely to adopt PM tools than
  enterprises, which is good news for a new entrant without a sales team.

## 2. Competitive landscape

### 2.1 The incumbents

| Tool | Positioning | Entry paid price (per user/mo, approx.) | Free tier |
| --- | --- | --- | --- |
| Jira | Software teams, sprints, 3,000+ integrations | ~$8 | Yes, up to 10 users |
| Linear | Fast, keyboard-driven issue tracker for engineering | ~$10 (Basic), ~$16 (Business) | Yes, 250 active issues, 2 teams |
| Asana | Structured teams, portfolios, workload | ~$11 (Starter), ~$25 (Advanced) | Yes, limited |
| monday.com | Visual "Work OS" for cross-functional teams | ~$9 | Yes, limited |
| ClickUp | Everything-in-one: 15+ views, docs, whiteboards | ~$7 | Yes |
| Notion | Docs-first with lightweight task tracking | ~$10 (Plus) | Yes |
| Basecamp | Opinionated, simple, flat pricing, no AI | Flat team pricing | Trial |
| Teamwork | Agency standard: time, billing, client work | Varies | Yes |

Observations:

- Every serious player has converged on the same core: tasks, projects, a
  board view, a list view, assignees, due dates, comments, and some automation.
- Differentiation now happens on speed and feel (Linear), breadth (ClickUp),
  docs integration (Notion), and vertical fit (Teamwork for agencies).
- Linear is the design reference for a whole generation of newer tools,
  including most open-source entrants.

### 2.2 What users complain about

These complaints repeat across review sites, Reddit, and comparison posts, and
each one is a potential wedge for a new product.

**Jira**
- Admin burden out of proportion for teams under about 30 people. Teams end up
  needing a dedicated admin.
- Non-engineering teams refuse to use it, so companies split work between Jira
  and spreadsheets.
- Docs require a separate paid product (Confluence).
- Value for money rated poorly by Capterra reviewers.

**Asana**
- Billing friction: minimum seat counts, and per-seat pricing that escalates
  fast.
- Weak admin controls outside the Enterprise tier.
- Custom fields and automations do not migrate cleanly, so switching costs are
  high.

**ClickUp**
- Complexity. The setup is demanding and the interface overwhelms newcomers.
- Engineering teams coming from Jira find sprint and issue management shallow.
- Performance has historically been a frequent complaint.

**Cross-cutting**
- "AI" features are often just conditional automation wearing a new label.
- AI credit systems run out quickly for heavy users on mid-tier plans.
- Price creep: the features small teams actually want (timeline, automations,
  guests) sit in the second or third paid tier.

### 2.3 Open-source projects to learn from

| Project | License | Stack | Notes |
| --- | --- | --- | --- |
| Plane | AGPL-3.0 | Django REST + Postgres + Redis, React/TypeScript/MobX, Tiptap editor, Celery workers | Closest open-source analogue to Linear/Jira. ~50k GitHub stars. Heavier to self-host. Has a paid edition. |
| Huly | EPL-2.0 | Multi-service | Pitched as an all-in-one replacement for several tools. Heavy install. |
| OpenProject | GPL | Ruby on Rails | Most complete traditional PM suite: Gantt, budgets, agile boards. Some features behind Enterprise. |
| Taiga | AGPL/MPL (sources disagree) | Django + Angular | Scrum-focused. No time tracking. Development pace reported to have slowed. |
| Vikunja | AGPL | Go + Vue | Lightest footprint. Personal or small team. Not a full PM suite. |

Plane in particular is worth reading for schema design (issues, cycles,
modules, states, labels, workspace membership) and for how it structures a
Linear-style UI.

### 2.4 Where the gaps appear to be

No source stated an underserved segment outright, but the pattern of
complaints and the vertical-specific roundups suggest these openings:

1. **Small teams priced out of the middle tier.** A tool that includes
   timeline, automations, and guests at the first paid tier, or on a flat team
   price, directly addresses the Asana and monday.com complaints.
2. **Mixed engineering and non-engineering teams.** Jira is too heavy for
   marketing; Asana is too loose for engineers. Few tools serve both well.
3. **Agencies, consultants, and freelancers.** Recurring demands: time and
   expense tracking, client portals, scope-change tracking, milestone billing.
   Teamwork owns this space but is priced and designed for larger agencies.
4. **Honest, bounded AI.** Summaries, triage, and drafting that are clearly
   scoped and not credit-gated could stand out against inflated "agent" claims.
5. **Fast and offline-tolerant.** Linear proved speed is a feature. Most
   competitors are still request-response apps that feel slow on poor networks.

## 3. Product trends to account for

- **AI agents are the headline feature in 2026.** Asana (AI Studio, AI
  teammates), monday.com (AI Blocks, AI resource planning), ClickUp, Notion,
  and Jira all ship branded agents. Linear has AI triage and issue summaries.
  Basecamp is the deliberate holdout with no AI at all.
- **Credit-metered AI** is the common pricing model and a common complaint.
- **Local-first and sync engines** are moving from niche to mainstream.
  Rocicorp's Zero reached 1.0 in June 2026. PowerSync, Electric, and Convex
  each pitch a different flavour of the same idea.
- **Consolidation.** Buyers want fewer subscriptions: PM plus docs plus time
  tracking plus light CRM in one tool.

## 4. Architecture patterns

### 4.1 Why Linear feels fast

Linear's architecture is the one most newer tools try to copy. From public
write-ups and talks by its engineers:

- The browser holds a full local replica of the workspace in IndexedDB,
  hydrated into an in-memory observable graph. The UI reads only local state.
- A user action mutates local state immediately, so the UI re-renders
  synchronously. The mutation is queued as a transaction and synced in the
  background.
- The server pushes incremental deltas to every connected client, which gives
  real-time collaboration for free.
- Offline edits sit in the transaction queue and flush on reconnect.
- Conflicts are mostly last-write-wins per field, with richer handling
  reserved for long-form text (one source claims CRDTs for descriptions; this
  is unconfirmed).

The cost is engineering effort: Linear built its own sync engine. In 2026
there are off-the-shelf options (section 5.3) that make this reachable for a
small team.

### 4.2 The pragmatic alternative

A conventional server-first app with optimistic updates and a realtime channel
(for example, Postgres plus Supabase Realtime or a WebSocket layer) gets most
of the perceived speed for far less complexity. It does not work offline and
it needs careful cache invalidation, but it is the path most templates and
tutorials take and the one with the most reference material.

Recommendation: start server-first with optimistic updates, but keep the data
model and client state shaped so a sync engine can be dropped in later. Do
not hand-roll a sync engine.

### 4.3 Multi-tenancy

Consensus for a SaaS of this type: a single shared Postgres schema where every
tenant-owned row carries a workspace identifier, with Row Level Security (RLS)
enforcing isolation in the database, not just in application code.

- Shared schema is cheapest to run and easiest to migrate. The risk is a
  missing filter leaking data, which RLS mitigates.
- Schema-per-tenant gives stronger isolation but becomes operationally painful
  past a few hundred tenants.
- Tenancy has to carry through background workers, caches, and analytics, not
  just the request path.
- Write tests that prove cross-tenant isolation, not only functional
  correctness.

## 5. Candidate tech stack

### 5.1 Frontend

- **Next.js (App Router) with TypeScript.** Largest ecosystem, best reference
  material for this exact kind of app, and pairs cleanly with Supabase.
- **Tailwind CSS plus a headless component library** (shadcn/ui or Radix).
- **Tiptap** for rich-text task descriptions and comments. Plane uses it; it
  has a clear path to collaborative editing via Yjs later.
- **TanStack Query** for server state with optimistic updates, unless a sync
  engine replaces it.

### 5.2 Drag and drop

All three main React libraries are maintained in 2026.

| Library | Fit |
| --- | --- |
| @dnd-kit | Default choice. Accessible, framework-agnostic, handles multi-container boards and custom collision detection. Slightly more setup. |
| @hello-pangea/dnd | Community fork of react-beautiful-dnd. Simplest API for a straightforward kanban. Less flexible. |
| Pragmatic drag and drop (Atlassian) | Lowest-level and best performance. Used in Jira and Confluence rewrites. More to build yourself. |

Recommendation: @dnd-kit. A PM app will quickly need more than a single list
(board columns, reordering within lists, dragging across groups), which is
where hello-pangea runs out of road.

### 5.3 Backend and data

- **Postgres** is the obvious database. Supabase bundles Postgres, Auth,
  Storage, RLS, and WebSocket Realtime, and has a well-trodden Next.js path.
- **ORM**: Drizzle if we want typed SQL and migrations in the repo; the
  Supabase client alone is enough for a first version.
- **Background jobs**: needed early for notifications, digests, and exports.
  Supabase Edge Functions plus pg_cron, or a small worker.
- **Sync engine options if we go local-first later:**
  - Zero (Rocicorp): 1.0 in 2026, Postgres-backed, no SSR yet, large bundle.
  - PowerSync: strongest offline story, works with Postgres and others,
    integrates with Supabase.
  - Electric: Postgres partial sync, now also pitching agent state.
  - Convex: a reactive backend rather than a sync engine. Replaces the
    backend instead of syncing an existing database.

### 5.4 Alternatives considered

- **Firebase**: weaker for relational queries, which a PM app needs.
- **Self-hosted Postgres + Auth.js**: more control, more to run. Reasonable if
  we later want to offer a self-hosted edition like Plane.
- **Django or Rails backend**: proven (Plane, OpenProject) but means two
  languages and a split codebase.

## 6. Minimal data model

Derived from how Plane, Linear, and Asana structure things, cut to an MVP.

```
Workspace
  └─ WorkspaceMember (user_id, role: owner | admin | member | guest)
  └─ Project
       ├─ ProjectMember (optional, for private projects)
       ├─ State / Status (ordered, e.g. Backlog, Todo, In Progress, Done; per project)
       ├─ Label
       └─ Task
            ├─ parent_task_id (subtasks)
            ├─ assignee_id, status_id, priority, due_date, sort_order
            ├─ TaskLabel (many-to-many)
            ├─ Comment
            ├─ Attachment
            └─ ActivityLog (who changed what, when)
User
Notification
```

Design notes:

- Every tenant-owned table carries `workspace_id` for RLS.
- Statuses are per project and ordered, not a global enum. Both Linear and
  Plane do this and it is painful to retrofit.
- `sort_order` on tasks (fractional indexing or a float with periodic
  rebalancing) supports drag reordering without rewriting whole columns.
- Activity log from day one, written by database triggers or a mutation layer,
  so history and notifications do not need a later migration.
- Defer: cycles/sprints, dependencies, custom fields, time tracking, Gantt,
  portfolios, client portals, budgets, SSO. All are real needs for specific
  segments but none belongs in the first release.

## 7. Suggested MVP scope

The smallest thing that someone would switch to:

1. Sign up, create a workspace, invite members by email, roles.
2. Create projects. Each has board and list views with per-project statuses.
3. Tasks with title, rich description, assignee, status, priority, due date,
   labels, subtasks, comments, attachments.
4. Drag and drop between and within columns, with optimistic updates and
   live updates to other viewers.
5. "My tasks" view across projects.
6. In-app and email notifications for assignments and mentions.
7. Keyboard shortcuts for the common actions (the Linear lesson).
8. Search.

Explicitly not in MVP: AI features, sprints, dependencies, time tracking,
Gantt, integrations beyond maybe GitHub, mobile apps, self-hosting.

## 8. Open questions

These change the design materially and need a decision before building:

1. **Who is this for?** Options: (a) small mixed teams, (b) engineering teams
   wanting a Linear-like tool, (c) agencies and consultants with client work,
   (d) ourselves first. The data model is similar; the UI, pricing, and first
   integrations are not.
2. **What is the one-line differentiator?** Price, speed, simplicity, a
   vertical, or AI. "Another Trello" will not get adopted.
3. **SaaS, self-hosted, or both?** Self-hosting drives stack choices toward
   portability (plain Postgres, Docker) and away from Supabase-specific
   features.
4. **Local-first from day one or later?** Day one is a bigger bet on a sync
   engine but produces the Linear feel. Later is cheaper but means some
   rework.
5. **Monetization.** Per-seat (industry norm, widely resented), flat per
   workspace (Basecamp), or free with paid add-ons.
6. **Solo build or team?** Affects how much of the open-source ecosystem we
   should lean on versus build.

## 9. Sources

Market and landscape
- [Top 10 Project Management Tools of 2026](https://guptadeepak.com/tools/top-10-project-management-tools-2026/)
- [Best Project Management Software For 2026 (monday.com)](https://monday.com/blog/project-management/project-management-software/)
- [25 best project management tools (Guideflow)](https://www.guideflow.com/blog/project-management-tools)
- [10 Top Online Project Management Tools Compared (ONES)](https://ones.com/blog/10-top-online-project-management-tools-compared-2026/)
- [ClickUp vs Asana 2026 (Automation Atlas)](https://automationatlas.io/answers/clickup-vs-asana-2026)
- [Asana vs Monday vs ClickUp (TrackingTime)](https://trackingtime.co/project-management-software/asana-vs-monday-vs-clickup.html)
- [Project management statistics (monday.com)](https://monday.com/blog/project-management/project-management-statistics/)
- [Project Management Software Is Booming (PM Global)](https://news.pm-global.co.uk/2026/02/project-management-software-is-booming-but-pms-must-lead-the-adoption/)
- [Project Management Software Statistics 2025 (Mosaic)](https://mosaicapp.com/post/project-management-software-statistics-facts-trends-2025)

Complaints and alternatives
- [Best Jira Alternatives in 2026 (ClickUp)](https://clickup.com/learn/topic/project-management/tools/jira/alternatives/)
- [Why I Switched from Jira (ClickUp)](https://clickup.com/blog/jira-alternatives/)
- [Jira vs ClickUp (monday.com)](https://monday.com/blog/rnd/jira-or-clickup/)
- [ClickUp vs Jira (Rock)](https://www.rock.so/blog/clickup-vs-jira)
- [ClickUp vs Jira: If You Ship Code, Stick With Jira (ZenPilot)](https://www.zenpilot.com/blog/clickup-vs-jira/)
- [Asana Alternatives 2026](https://checkthat.ai/brands/asana/alternatives)
- [ClickUp Reviews (Capterra)](https://www.capterra.com/p/158833/ClickUp/reviews/?page=26)

Pricing
- [How much does Linear cost in 2026?](https://automationatlas.io/answers/linear-pricing-2026/)
- [Linear pricing (Carly)](https://www.usecarly.com/blog/linear-pricing/)
- [Linear plans (TemperStack)](https://www.temperstack.com/plans/linear/)

Open source
- [Best Open Source PM Software 2026 (Digital Project Manager)](https://thedigitalprojectmanager.com/tools/best-open-source-project-management-software/)
- [Best Open Source PM Tools (Worklenz)](https://worklenz.com/open-source-project-management-tools/)
- [Plane vs Vikunja vs OpenProject (Homelab Addiction)](https://homelabaddiction.com/best-self-hosted-project-management-tools-for-homelabs-in-2026-plane-vs-vikunja-vs-openproject/)
- [Best open-source PM software (Kaneo)](https://kaneo.app/guides/best-open-source-project-management-software)
- [What is Plane? (Plane docs)](https://www.mintlify.com/makeplane/plane/introduction)

AI trends
- [8 Best AI for Project Management in 2026 (Dupple)](https://dupple.com/learn/best-ai-for-project-management)
- [Best AI Agents for Project Management 2026 (Fast.io)](https://fast.io/resources/best-ai-agents-project-management-2026/)
- [Best AI Tools and Agents for PM (Leland)](https://www.joinleland.com/library/a/ai-project-management-tools)

Architecture
- [Why Linear Feels Fast (DEV)](https://dev.to/0xgosu/why-linear-feels-fast-local-data-small-updates-and-product-discipline-1m53)
- [How Linear Feels Instant: Local-First Sync (Braindetox)](https://braindetox.kr/en/posts/linear_local_first_speed_2026.html)
- [Building a Sync Engine (Medium)](https://medium.com/@sohail_saifii/building-a-sync-engine-local-first-software-that-actually-works-76ddea9770f5)
- [Building Local-First Apps (Turso)](https://turso.tech/blog/building-local-first-apps-the-complete-guide-to-offline-first-database-sync)
- [Zero 1.0 (InfoQ)](https://infoq.com/news/2026/06/zero-version-1)
- [When to use Zero (Rocicorp docs)](https://zero.rocicorp.dev/docs/when-to-use)
- [Offline-first apps with Supabase and PowerSync](https://www.powersync.com/blog/offline-first-apps-made-simple-supabase-powersync)
- [Electric: alternatives](https://electric-sql.com/docs/reference/alternatives)
- [Convex vs InstantDB vs ElectricSQL (pkgpulse)](https://www.pkgpulse.com/guides/convex-vs-instantdb-vs-electricsql-real-time-sync-2026)
- [Local-first apps and CRDT sync engines (DevToolLab)](https://devtoollab.com/blog/local-first-apps-crdt-sync-engine-guide)

Multi-tenancy
- [How to architect multi-tenant SaaS on Postgres (ClickHouse)](https://clickhouse.com/resources/engineering/multi-tenant-saas-postgres-architecture)
- [Multi-Tenant SaaS Architecture with Postgres RLS (Makerkit)](https://makerkit.dev/blog/md/tutorials/multi-tenant-saas-architecture)
- [Multi-Tenant SaaS with PostgreSQL RLS (Skyline Codes)](https://skylinecodes.substack.com/p/how-to-architect-a-multi-tenant-saas)
- [Multi-Tenant API in Node.js with PostgreSQL RLS](https://1xapi.com/blog/multi-tenant-api-nodejs-postgresql-rls-2026)

Frontend libraries
- [Top 5 drag and drop libraries for React (Puck)](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [dnd-kit vs react-beautiful-dnd vs pragmatic-drag-and-drop (pkgpulse)](https://www.pkgpulse.com/guides/dnd-kit-vs-react-beautiful-dnd-vs-pragmatic-drag-drop-2026)
- [How to Build a Kanban App in Next.js 2026 (Frontkit)](https://thefrontkit.com/blogs/how-to-build-a-kanban-app-in-nextjs-2026)
- [Connect Supabase to a Next.js Template (Frontkit)](https://thefrontkit.com/blogs/connect-supabase-to-nextjs-template-2026)

Agencies and verticals
- [Choosing the Best PM Tool for Agencies in 2026 (Ravetree)](https://www.ravetree.com/blog/choosing-the-best-project-management-tool-for-agencies)
- [Teamwork review 2026](https://aiindigo.com/blog/teamwork-review-2026-the-agency-standard-for-project-management)
- [PM software for consultants (Clinked)](https://www.clinked.com/blog/project-management-software-for-consultants)
