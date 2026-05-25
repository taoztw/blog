# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager: **pnpm** (lockfile is `pnpm-lock.yaml`).

```bash
pnpm dev                # Next.js dev server with Turbopack
pnpm build              # Production build (Next.js)
pnpm lint               # ESLint
pnpm typecheck          # tsc --noEmit (only run when explicitly requested — see Development Workflow)

# Database (Drizzle + Cloudflare D1)
pnpm db:generate        # Generate migration SQL from schema changes
pnpm db:migrate         # Apply pending migrations
pnpm db:push            # Push schema directly (skip migration files — dev only)
pnpm db:studio          # Open Drizzle Studio

# Cloudflare / deploy
pnpm preview            # Build with OpenNext + preview locally as a Worker
pnpm deploy             # Build + deploy to Cloudflare Workers (keeps vars)
pnpm upload             # Build + upload bundle without activating
pnpm cf-typegen         # Regenerate cloudflare-env.d.ts from wrangler.toml bindings

# One-off
pnpm create-users       # tsx scripts/create-users.ts — seed users
pnpm auth:generate      # Regenerate better-auth Drizzle schema from auth config
```

### Development Workflow

- **Type checking**: Do not run `pnpm typecheck` or `tsc` unless the user explicitly requests it. Implementation is considered complete once code is written; type verification is opt-in.

## Architecture

### Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack dev)
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Auth**: [better-auth](https://better-auth.com) (NOT NextAuth) with email/password + GitHub + Google + admin plugin
- **API**: tRPC v11 + TanStack Query, end-to-end type safety
- **UI**: Tailwind CSS v4 + shadcn/ui (style: `new-york`, base: `slate`)
- **Editor**: Plate.js (`@platejs/*`) for rich-text post editing, plus Tiptap in some surfaces
- **i18n**: next-intl (locales `en`, `zh`; default `zh`)
- **URL state**: nuqs (syncing table state to query params)
- **Deployment**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)

### Directory Layout

- `src/app/` — App Router
  - `[locale]/(blog)/` — public blog pages (intl-aware)
  - `[locale]/(auth)/` — sign-in/up pages (intl-aware)
  - `(dashboard)/dashboard/` — admin (NOT intl-aware; excluded by middleware)
  - `(editors)/`, `editor/` — editor surfaces (also excluded from intl middleware)
  - `api/` — REST endpoints (`auth`, `trpc`, `upload`, `images`, `file`, `ai`, `comment-upload`)
- `src/server/api/routers/` — tRPC routers (see list below)
- `src/server/db/schemas/` — Drizzle table definitions, split per domain; `schema.ts` re-exports all
- `src/features/{editor,comments,tags}/` — feature-local components/logic outside the shared `components/`
- `src/components/` — shared components (`ui/` = shadcn primitives, `data-table/` = TanStack Table system, `editor/` = Plate UI pieces)
- `src/hooks/` — shared hooks (`use-data-table`, `use-debounced-callback`, `use-mobile`, …)
- `src/lib/` — utilities, auth client, image service, parsers, validations
- `src/trpc/` — tRPC client/server setup (`server.ts` for RSC, `react.tsx` for client)
- `src/i18n/` — next-intl config (`routing.ts`, `request.ts`, `navigation.ts`)
- `messages/` — `en.json` / `zh.json`
- `migrations/` — legacy local migrations (not active)
- `migrations_productions/` — **active** migrations, output target of `db:generate`
- `.wrangler/state/v3/d1/*.sqlite` — local D1 dev database (read by `drizzle.config.ts` in dev)
- `wrangler.toml` — D1 binding `DB`, R2 binding `NEXT_INC_CACHE_R2_BUCKET`, custom domain `tz1.me`

### tRPC

- **Context** (`src/server/api/trpc.ts`): exposes `db` (Drizzle D1 instance from `getDB()`) and `session` (from better-auth `auth.api.getSession`).
- **Procedures**: `publicProcedure` (anyone, session may be null) and `protectedProcedure` (throws UNAUTHORIZED if no session.user). All procedures run through a `timingMiddleware` that **adds a random 100-500ms delay in dev** to surface waterfalls.
- **Routers** registered in `src/server/api/root.ts`: `post`, `category`, `tag`, `comment`, `commentReactions`, `project`, `question`, `answer`, `journal`, `journalComment`.
- **Server-side calls**: import `api` from `@/trpc/server` (RSC). Client side: `api` from `@/trpc/react`.
- **Transformer**: superjson. **Validation errors**: Zod errors are surfaced in `data.zodError` on the client.

### Database

- Schema is **split by domain** under `src/server/db/schemas/` (`auth.ts`, `posts.ts`, `categories.ts`, `comments.ts`, `journals.ts`, `journal-comments.ts`, `projects.ts`, `questions.ts`, `tags.ts`, `statistics.ts`, `common.ts`, `enums.ts`, `relations.ts`) and re-exported from `schema.ts`. Add new tables in their own file and re-export.
- **Connection**: `getDB()` in `src/server/db/db.ts` lazily creates a `drizzle()` instance from Cloudflare's `env.DB` binding and caches it per React render.
- **Migrations**: `drizzle.config.ts` reads `./src/server/db/schemas` and writes to `./migrations_productions`. In dev it auto-finds the local D1 sqlite under `.wrangler/state/v3/d1/`; in production it uses the D1 HTTP driver with `CLOUDFLARE_*` env vars.
- **Auth schema regen**: after changing better-auth config, run `pnpm auth:generate` to refresh `src/server/db/schemas/new-auth-schema.ts`.

### Domain Model

- **Posts**: status (draft/published), category, view tracking (IP-based dedupe), reactions
- **Categories / Tags**: post taxonomy
- **Comments**: nested (parent-child) with reactions; separate `journal-comments` for journals
- **Journals / Projects**: additional content types beyond blog posts
- **Questions / Answers**: Q&A surface
- **Users**: role-based (admin/user) via better-auth `admin` plugin

### Auth (better-auth)

- Config: `src/lib/auth/auth.ts` — Drizzle adapter (sqlite), email/password (auto sign-in, min 6 chars), GitHub + Google OAuth, 1-day cookie cache, `nextCookies()` + `admin()` plugins.
- Client: `src/lib/auth/authClient.ts`
- Permissions helper: `src/lib/auth/permission.ts`
- Trusted origins: `http://localhost:3000`, `http://127.0.0.1:3000` (add prod origin when needed).

### i18n

- `defaultLocale: "zh"`, `locales: ["en", "zh"]` (`src/i18n/routing.ts`)
- Middleware (`src/middleware.ts`) applies next-intl routing but **excludes** `api`, `trpc`, `_next`, `_vercel`, `dashboard`, `editors`, and anything with a dot. Dashboard pages live outside `[locale]` and are not localized.

### Environment Variables

Validated by `@t3-oss/env-nextjs` in `src/env.js`. Required for dev: `AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`. Optional: `HTTP_PROXY` (for OAuth from behind a proxy), `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_D1_DATABASE_ID` / `CLOUDFLARE_TOKEN` (only needed when running `db:generate`/`db:migrate` against production D1).

### Type Safety

- Drizzle Zod schemas for input validation
- tRPC end-to-end inference; use `RouterOutputs`/`RouterInputs` from `@/trpc/server`
- TypeScript strict mode + `noUncheckedIndexedAccess`

---

## Ink Design System (墨色设计系统)

The blog uses a custom warm-tone color system inspired by Chinese calligraphy (xuan paper + pine soot ink). **Never use cold pure grays** (`oklch(x 0 0)` or `text-gray-*`). All neutrals carry a warm hue (H≈40°-80°).

**Live reference page**: `/design-system` (source: `src/app/[locale]/(blog)/design-system/page.tsx`)

### Color Tokens — Ink Scale

**Mode-aware**: in dark mode the scale is **reversed** so `ink-50` is always "lightest in current theme" and `ink-900` is always "darkest". This means `text-ink-700` always renders as body text, `bg-ink-100` always renders as page bg — both modes.

| Token | Light hex | Dark hex | Usage (mode-invariant) |
|-------|-----------|----------|------------------------|
| `ink-50` | `#FEFDFB` | `#1D1C19` | Page / Card background |
| `ink-100` | `#FAF9F6` | `#2C2520` | Secondary background |
| `ink-200` | `#F4F2ED` | `#453B32` | Muted background |
| `ink-300` | `#E2DDD4` | `#6B5F52` | Borders / Dividers |
| `ink-400` | `#C4BDB0` | `#887B6C` | Disabled / Placeholder (mid-tone) |
| `ink-500` | `#887B6C` | `#C4BDB0` | Auxiliary text (≥14px) |
| `ink-600` | `#6B5F52` | `#E2DDD4` | Muted foreground |
| `ink-700` | `#453B32` | `#F4F2ED` | Body text |
| `ink-800` | `#2C2520` | `#FAF9F6` | Headings / Foreground |
| `ink-900` | `#1D1C19` | `#FEFDFB` | High-contrast emphasis |

Tailwind usage: `bg-ink-50`, `text-ink-800`, `border-ink-300`, etc. — pick by **role**, not by light-mode hex.

**Anti-pattern — never manually flip the ink scale:**

```tsx
// ❌ WRONG — the scale is already mode-aware, this double-inverts in dark mode
<p className="text-ink-700 dark:text-ink-300">...</p>
<footer className="bg-ink-50 dark:bg-ink-900/50">...</footer>

// ✅ RIGHT — base class works in both modes
<p className="text-ink-700">...</p>
<footer className="bg-ink-50">...</footer>
```

For **theme-invariant** elements (always-dark hero panels, always-light overlays, decorative banners that shouldn't follow the theme), the ink scale is the wrong tool — use literal arbitrary values instead:

```tsx
// ✅ Always-dark decoration panel (e.g. auth/layout.tsx)
<div className="bg-[#1d1c19]">
  <div className="bg-black/40" />
  <p className="text-white/40">© 2026</p>
</div>
```

### Accent & State Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `seal` | `#C23B22` | Brand accent (印章朱红), same as `destructive` |
| `success` | `#5B7A5E` | Success states (苔绿) |
| `warning` | `#B8863E` | Warning states (赭黄) |
| `info` | `#5C7A8A` | Info states (青墨) |

### Semantic Token Rules

- **Prefer semantic tokens** over direct ink colors: `bg-background`, `text-foreground`, `border-border`
- Use `text-muted-foreground` for secondary text (maps to ink-600 light / ink-500 dark)
- Use ink scale directly only when finer control is needed: `text-ink-400` for disabled text
- Transparency: `bg-primary/5`, `bg-seal/10` for tinted backgrounds
- **Never hardcode** `text-gray-*` or `bg-white` — use semantic tokens for automatic dark mode

### Typography

- **Body font**: Geist Sans (`--font-geist-sans`) — variable, weights 100-900
- **Display font**: Cormorant Garamond (`--font-cormorant`) — weights 300/400/500, decorative headings only

Weight classes follow Tailwind defaults (`font-thin` 100 … `font-black` 900).

---

## UI Components

### Data Table System

Dashboard tables use a shared system in `src/components/data-table/`, built on TanStack React Table v8 with URL state synced via nuqs.

**Files**: `data-table.tsx` (wrapper), `data-table-column-header.tsx` (sort/hide dropdown), `data-table-toolbar.tsx` (auto-renders filters from column `meta.variant`), `data-table-view-options.tsx`, `data-table-pagination.tsx`, `data-table-faceted-filter.tsx`, `data-table-skeleton.tsx`. Supporting: `src/types/data-table.ts` (ColumnMeta augmentation), `src/lib/data-table.ts` (pinning utility).

**URL state (nuqs)**: pagination, sorting, and column filters live in the URL so refresh and link-sharing preserve state. Wiring is in `useDataTable` (`src/hooks/use-data-table.ts`); custom sort parser (JSON + Zod) in `src/lib/parsers.ts`; text filters debounced 300ms via `use-debounced-callback`. Column visibility stays in React state (not URL). `NuqsAdapter` wraps the dashboard layout (`src/app/(dashboard)/layout.tsx`). Example URL: `?page=2&perPage=20&sort=[{"id":"title","desc":false}]&title=search&status=PUBLISHED,DRAFT`.

**Page pattern:**

```tsx
"use client";

export function XxxTable() {
  const { data, isFetching } = api.xxx.getMany.useQuery({ limit: 100 });
  const columns = useMemo(() => createXxxColumns({ onEdit, onDelete }), [deps]);
  const { table } = useDataTable({ data: data?.items ?? [], columns });

  if (isFetching && !data) {
    return <DataTableSkeleton columnCount={N} rowCount={10} filterCount={2} />;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
```

**Column pattern:**

```tsx
{
  accessorKey: "title",
  meta: { label: "标题", placeholder: "搜索...", variant: "text" },  // → text input filter
  header: ({ column }) => <DataTableColumnHeader column={column} label="标题" />,
  enableColumnFilter: true,
},
{
  accessorKey: "status",
  meta: {
    label: "状态",
    variant: "select",  // or "multiSelect" → faceted popover
    options: [{ label: "已发布", value: "published" }, { label: "草稿", value: "draft" }],
  },
  header: ({ column }) => <DataTableColumnHeader column={column} label="状态" />,
  filterFn: (row, id, value) => Array.isArray(value) ? value.includes(row.getValue(id)) : true,
  enableColumnFilter: true,
},
```

**Rules:**
- `meta.variant` drives filter type (`"text"` / `"select"` / `"multiSelect"`); `meta.label` shows in view-options + header
- Always set `enableColumnFilter: true` on filterable columns; add `filterFn` for select variants
- Set `enableSorting: false` and `enableHiding: false` on image/actions columns
- Fetch with `limit: 100` for client-side pagination/filtering/sorting
- Use `DataTableSkeleton` for initial load (before first data arrives)

### Spinner

`Spinner` (`src/components/ui/spinner.tsx`) for loading states. Default `size-4 animate-spin`; override via `className`. Includes `role="status"` + `aria-label="Loading"`.

```tsx
<Spinner className="size-5 mx-auto" />
```
