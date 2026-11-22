# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, etc.) when working with code in this repository.

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

- **Framework**: Next.js 16 (App Router, Turbopack for dev and build)
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Auth**: [better-auth](https://better-auth.com) (NOT NextAuth) with email/password + GitHub + Google + admin plugin
- **API**: tRPC v11 + TanStack Query, end-to-end type safety
- **UI**: Tailwind CSS v4 + shadcn/ui (style: `new-york`, base: `slate`)
- **Editor**: Tiptap v3 (`@tiptap/*`, ProseMirror-based) for posts and journals — see the Editor section below
- **i18n**: next-intl (locales `en`, `zh`; default `zh`)
- **URL state**: nuqs (syncing table state to query params)
- **Deployment**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)

### Directory Layout

- `src/app/` — App Router
  - `[locale]/(blog)/` — public blog pages (intl-aware)
  - `[locale]/(auth)/` — sign-in/up pages (intl-aware)
  - `(dashboard)/dashboard/` — admin (NOT intl-aware; excluded by middleware)
  - `editor/` — editor playground, not persisted (also excluded from intl middleware)
  - `api/` — REST endpoints (`auth`, `trpc`, `upload`, `images`, `file`, `comment-upload`)
- `src/server/api/routers/` — tRPC routers (see list below)
- `src/server/db/schemas/` — Drizzle table definitions, split per domain; `schema.ts` re-exports all
- `src/features/{comments,tags}/` — feature-local components/logic outside the shared `components/`
- `src/components/` — shared components (`ui/` = shadcn primitives, `data-table/` = TanStack Table system, `tiptap/` = editor + read-only renderer)
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
- Middleware (`src/middleware.ts`) applies next-intl routing but **excludes** `api`, `trpc`, `_next`, `_vercel`, `dashboard`, `editor`, and anything with a dot. Dashboard pages live outside `[locale]` and are not localized.

### Editor (Tiptap)

Everything lives in `src/components/tiptap/`. Post and journal `content` columns store the Tiptap document as a JSON string (`{ "type": "doc", ... }`).

- `extensions.ts` — `createContentExtensions()`, the **single schema source** shared by the editor and the read-only renderer. Add a node/mark here or the two will disagree. Editing-only behaviour (placeholder, slash menu, paste/drop upload) is added in `tiptap-editor.tsx`, not here.
- `tiptap-editor.tsx` — `<TiptapEditor initialValue onChange />` (client). `initialValue` is read once on mount; remount with a `key` to load another document.
- `tiptap-content.tsx` — `<TiptapContent doc />`, read-only rendering via `@tiptap/static-renderer`. It has no `"use client"`: used from a server component (the blog post page), highlighting and KaTeX run on the server and no editor code ships to the browser.
- `document.ts` — pure JSON helpers, safe to import anywhere: `loadDocument(raw)`, `extractTitle`, `withoutTitle`, `collectHeadings` (TOC + heading anchor ids come from this one function, so they always match).
- `plate-convert.ts` — converts legacy Plate JSON (a top-level **array**) to a Tiptap doc. `loadDocument` calls it automatically, so old rows render and open in the editor without a DB migration, and are rewritten in the new format on save. Unknown nodes degrade to paragraphs; text is never dropped.
- `callout.ts`, `slash-command.tsx`, `toolbar.tsx`, `bubble-toolbar.tsx`, `math-dialog.tsx`, `upload.ts` (image upload through `/api/upload`), `tiptap.css` (content styles scoped to `.tiptap-content`, shared by editor and renderer).

Rules:
- Always read stored content through `loadDocument()` — never `JSON.parse` it directly, or legacy rows break.
- The first top-level `h1` is the post title (`extractTitle`); reader pages strip it with `withoutTitle` and show the title in the page header.
- Playground for trying the editor without saving: `/editor`.

### Environment Variables

Validated by `@t3-oss/env-nextjs` in `src/env.js`. Required for dev: `AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`. Optional: `HTTP_PROXY` (for OAuth from behind a proxy), `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_D1_DATABASE_ID` / `CLOUDFLARE_TOKEN` (only needed when running `db:generate`/`db:migrate` against production D1).

### Type Safety

- Drizzle Zod schemas for input validation
- tRPC end-to-end inference; use `RouterOutputs`/`RouterInputs` from `@/trpc/server`
- TypeScript strict mode + `noUncheckedIndexedAccess`

---

## Color System — 纯白底 + 冷中性灰 + 可选品牌色

The blog uses a **pure-white background + cold neutral gray** palette (H≈220°), with all brand color expressed through a single **user-selectable brand accent** (`--brand`). Source of truth for tokens: `src/styles/globals.css`. Source of truth for the brand presets + injection logic: `src/lib/accent.ts`.

**Live reference page**: `/design-system` (source: `src/app/[locale]/(blog)/design-system/page.tsx`)

### Brand Accent — `--brand`

- **User-selectable**, default **deep blue** (`blue`). 8 presets (each with a dark-mode variant) live in `BRAND_PRESETS` in `src/lib/accent.ts`.
- The visitor picks a color from the floating-nav **主题色** popover (`src/components/brand-picker.tsx`); the choice is persisted to `localStorage` under `brand-accent`.
- **State + persistence**: `src/components/brand-provider.tsx` (`BrandProvider` + `useBrand`) holds the current brand, re-applies `--brand` on selection and on light/dark toggle, and writes `localStorage`. Mounted in `src/app/layout.tsx`.
- **Flicker-free**: an inline body-top script (`ACCENT_INJECT`) reads `localStorage` (falling back to the default) and writes `--brand` before first paint.
- **Single source, full-site linkage**: `--seal`, `--sidebar-primary`, `--chart-1`, `--ring`, `--highlight` all point to `var(--brand)`, so the chosen color updates links, buttons, logo accents, active states, focus rings, and the primary chart color at once.

> ⚠️ Do **not** repurpose shadcn's `--accent` token for the brand color — `--accent` is the muted **hover background** (cold gray) used by dozens of shadcn components. The brand color always goes through `--brand` (and its aliases above). To add/remove a brand option, edit `BRAND_PRESETS` only.

### Color Tokens — Cold Neutral Scale (`ink-*`)

The `ink-*` names are retained for compatibility but now map to **cold neutrals**. **Mode-aware**: in dark mode the scale is **reversed** so `ink-50` is always "lightest in current theme" and `ink-900` always "darkest". `text-ink-700` always renders as body text, `bg-ink-100` always as page bg — both modes.

| Token | Light hex | Dark hex | Usage (mode-invariant) |
|-------|-----------|----------|------------------------|
| `ink-50` | `#FFFFFF` | `#16181D` | Page / Card background |
| `ink-100` | `#F6F7F9` | `#1D2027` | Secondary background |
| `ink-200` | `#ECECF0` | `#22262E` | Muted background |
| `ink-300` | `#DFE2E7` | `#2A2E37` | Borders / Dividers |
| `ink-400` | `#AEB4BD` | `#5B636D` | Disabled / Placeholder (mid-tone) |
| `ink-500` | `#8B939C` | `#7D8590` | Auxiliary text (≥14px) |
| `ink-600` | `#5B636D` | `#9AA1AB` | Muted foreground |
| `ink-700` | `#3D444D` | `#C5CCD4` | Body text |
| `ink-800` | `#1F2328` | `#F1F4F7` | Headings / Foreground |
| `ink-900` | `#14171A` | `#FFFFFF` | High-contrast emphasis |

Tailwind usage: `bg-ink-50`, `text-ink-800`, `border-ink-300`, etc. — pick by **role**, not by light-mode hex.

**Anti-pattern — never manually flip the ink scale:**

```tsx
// ❌ WRONG — the scale is already mode-aware, this double-inverts in dark mode
<p className="text-ink-700 dark:text-ink-300">...</p>

// ✅ RIGHT — base class works in both modes
<p className="text-ink-700">...</p>
```

For **theme-invariant** elements (always-dark/always-light decorative panels), the ink scale is the wrong tool — use literal arbitrary values instead:

```tsx
// ✅ Always-dark decoration panel
<div className="bg-[#16181d]">
  <p className="text-white/40">© 2026</p>
</div>
```

### Accent & State Colors

| Token | Value | Usage |
|-------|-------|-------|
| `brand` | user-selectable, default `#2563eb` (8 presets in `accent.ts`) | Brand accent — links, buttons, logo, active state, focus ring |
| `seal` | `var(--brand)` | Alias of brand (legacy name, used across blog components) |
| `success` | `#1F9E6E` (dark `#46C08B`) | Success states |
| `warning` | `#D97706` (dark `#F0A93A`) | Warning states |
| `info` | `#2F88D8` (dark `#5AAEF0`) | Info states |
| `destructive` | `#DC2626` (dark `#F0686D`) | Errors / destructive actions (no longer tied to brand) |

### Semantic Token Rules

- **Prefer semantic tokens** over direct ink colors: `bg-background`, `text-foreground`, `border-border`
- Use `text-muted-foreground` for secondary text
- For brand-colored UI use `text-seal` / `bg-seal/10` / `text-brand` (all follow the random `--brand`)
- Use ink scale directly only when finer control is needed: `text-ink-400` for disabled text
- `bg-white` / `text-gray-*` now resolve close to the palette, but still **prefer semantic tokens** so dark mode stays automatic

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
