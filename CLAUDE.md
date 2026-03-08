# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Authentication**: NextAuth.js with GitHub and Google providers
- **API**: tRPC for type-safe API calls
- **UI**: Tailwind CSS + shadcn/ui components
- **Internationalization**: next-intl (supports English and Chinese)
- **URL State**: nuqs for syncing UI state to URL query params
- **Deployment**: Cloudflare Workers with OpenNext

### Project Structure

- **App Router Layout**: Uses `[locale]` dynamic segments for i18n
- **Route Groups**:
  - `(blog)` - Public blog pages
  - `(auth)` - Authentication pages
  - `(dashboard)` - Admin dashboard (separate layout)
- **Database Schema**: Located in `src/server/db/schema.ts`
- **tRPC Routers**: Located in `src/server/api/routers/`

### Key Features

1. **Blog System**: Posts with categories, views tracking, reactions (like/dislike)
2. **Comment System**: Nested comments with reactions
3. **User Management**: Role-based access (admin/user)
4. **File Upload**: Image upload with Cloudflare integration
5. **Dashboard**: Admin interface for managing posts, categories, users

### Database Schema

- **Users**: Authentication with role-based permissions
- **Posts**: Blog posts with status (draft/published), categories, view tracking
- **Categories**: Post categorization
- **Comments**: Nested comment system with parent-child relationships
- **Reactions**: Like/dislike system for posts and comments
- **Post Views**: IP-based view tracking to prevent duplicate counts

### Environment Setup

- Development uses local SQLite database (`.wrangler/state/v3/d1/`)
- Production uses Cloudflare D1
- Requires GitHub and Google OAuth credentials
- HTTP proxy support for development

### Type Safety

- Uses Drizzle Zod schemas for validation
- tRPC provides end-to-end type safety
- Strict TypeScript configuration with `noUncheckedIndexedAccess`

### Deployment Notes

- Built for Cloudflare Workers using OpenNext
- Uses Cloudflare D1 for production database
- Image uploads handled through Cloudflare

### Development Workflow

- **Type Checking**: Do not run type checking commands unless explicitly requested by the user
- Code completion is considered finished once implementation is done, without requiring type verification

### Ink Design System (墨色设计系统)

The blog uses a custom warm-tone color system inspired by Chinese calligraphy materials (xuan paper + pine soot ink). **Never use cold pure grays** (`oklch(x 0 0)` or `text-gray-*`). All neutrals carry a warm hue (H≈40°-80°).

**Live reference page**: `/design-system` (source: `src/app/[locale]/(blog)/design-system/page.tsx`)

#### Color Tokens — Ink Scale

| Token | Hex | Usage |
|-------|-----|-------|
| `ink-50` | `#FEFDFB` | Card / Popover background |
| `ink-100` | `#FAF9F6` | Page background (宣纸白) |
| `ink-200` | `#F4F2ED` | Secondary / Muted background |
| `ink-300` | `#E2DDD4` | Borders / Dividers |
| `ink-400` | `#C4BDB0` | Disabled / Placeholder |
| `ink-500` | `#887B6C` | Auxiliary text (≥14px only) |
| `ink-600` | `#6B5F52` | Muted foreground (light mode) |
| `ink-700` | `#453B32` | Body text |
| `ink-800` | `#2C2520` | Headings / Foreground |
| `ink-900` | `#1D1C19` | Dark mode background |

Tailwind usage: `bg-ink-50`, `text-ink-800`, `border-ink-300`, etc.

#### Accent & State Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `seal` | `#C23B22` | Brand accent (印章朱红), same as `destructive` |
| `success` | `#5B7A5E` | Success states (苔绿) |
| `warning` | `#B8863E` | Warning states (赭黄) |
| `info` | `#5C7A8A` | Info states (青墨) |

#### Semantic Token Rules

- **Prefer semantic tokens** over direct ink colors: `bg-background`, `text-foreground`, `border-border`
- Use `text-muted-foreground` for secondary text (maps to ink-600 light / ink-500 dark)
- Use ink scale directly only when finer control is needed: `text-ink-400` for disabled text
- Transparency: `bg-primary/5`, `bg-seal/10` for tinted backgrounds
- **Never hardcode** `text-gray-*` or `bg-white` — use semantic tokens for automatic dark mode

#### Typography

- **Body font**: Geist Sans (`--font-geist-sans`) — variable font, weights 100-900
- **Display font**: Cormorant Garamond (`--font-cormorant`) — weights 300/400/500, for decorative headings only

#### Fonts

| Weight | Tailwind Class | Name |
|--------|---------------|------|
| 100 | `font-thin` | Thin / 极细 |
| 200 | `font-extralight` | Extra Light / 特细 |
| 300 | `font-light` | Light / 细体 |
| 400 | `font-normal` | Regular / 常规 |
| 500 | `font-medium` | Medium / 中等 |
| 600 | `font-semibold` | Semi Bold / 半粗 |
| 700 | `font-bold` | Bold / 粗体 |
| 800 | `font-extrabold` | Extra Bold / 特粗 |
| 900 | `font-black` | Black / 极粗 |

### UI Components

#### Data Table System

Dashboard tables use a shared component system located in `src/components/data-table/`, built on TanStack React Table v8.

**Components:**

| File | Purpose |
|------|---------|
| `data-table.tsx` | Core table wrapper, renders headers/body/pagination |
| `data-table-column-header.tsx` | Column header with sort dropdown (升序/降序/重置) and hide toggle |
| `data-table-toolbar.tsx` | Auto-renders filters based on column `meta.variant`, includes reset and view options |
| `data-table-view-options.tsx` | Popover for toggling column visibility |
| `data-table-pagination.tsx` | Page size selector + first/prev/next/last navigation |
| `data-table-faceted-filter.tsx` | Popover multi/single select filter with badges |
| `data-table-skeleton.tsx` | Loading skeleton matching table layout |

**Supporting files:** `src/types/data-table.ts` (ColumnMeta type augmentation), `src/lib/data-table.ts` (pinning utility)

**URL State Management (nuqs):**

Table state (pagination, sorting, filters) is synced to URL query params via [`nuqs`](https://nuqs.47ng.com/). Filters/sort/page survive page refresh and can be shared via URL.

- **Provider**: `NuqsAdapter` wraps the dashboard layout (`src/app/(dashboard)/layout.tsx`)
- **Hook**: `useDataTable` (`src/hooks/use-data-table.ts`) bridges TanStack Table state with URL
- **Parsers**: `src/lib/parsers.ts` — custom `createParser` for sorting state (JSON serialization with Zod validation)
- **Debounce**: Text filter values debounced 300ms before URL update (`src/hooks/use-debounced-callback.ts`)
- **Column visibility**: stays in React state (not URL)

nuqs key APIs used:
- `useQueryState(key, parser)` — single URL param (pagination, sorting)
- `useQueryStates(parsers)` — multiple URL params at once (all column filters)
- `parseAsInteger`, `parseAsString`, `parseAsArrayOf` — built-in type parsers
- `createParser({ parse, serialize, eq })` — custom parser for complex types (sorting JSON)
- `.withOptions({ history: "replace", clearOnDefault: true, shallow: true })` — URL update behavior
- `.withDefault(value)` — fallback when param is absent from URL

URL param examples: `?page=2&perPage=20&sort=[{"id":"title","desc":false}]&title=search&status=PUBLISHED,DRAFT`

**Architecture pattern — Table page component:**

```tsx
"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useDataTable } from "@/hooks/use-data-table";

export function XxxTable() {
  const { data, isFetching } = api.xxx.getMany.useQuery({ limit: 100 });

  const columns = useMemo(() => createXxxColumns({ onEdit, onDelete }), [deps]);

  const { table } = useDataTable({
    data: data?.items ?? [],
    columns,
  });

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

**Architecture pattern — Column definitions:**

```tsx
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export const createXxxColumns = ({ onEdit, onDelete }): ColumnDef<Xxx>[] => [
  {
    accessorKey: "title",
    meta: { label: "标题", placeholder: "搜索...", variant: "text" }, // text search filter
    header: ({ column }) => <DataTableColumnHeader column={column} label="标题" />,
    enableColumnFilter: true,
  },
  {
    accessorKey: "status",
    meta: {
      label: "状态",
      variant: "select", // or "multiSelect"
      options: [
        { label: "已发布", value: "published" },
        { label: "草稿", value: "draft" },
      ],
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label="状态" />,
    filterFn: (row, id, value) => Array.isArray(value) ? value.includes(row.getValue(id)) : true,
    enableColumnFilter: true,
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => { /* DropdownMenu with edit/delete */ },
  },
];
```

**Key rules:**
- Column `meta.variant` controls filter type: `"text"` = input, `"select"` / `"multiSelect"` = faceted popover
- Column `meta.label` is used in view-options toggle and column header
- Always set `enableColumnFilter: true` on columns with filter `variant`
- For select filters, add `filterFn` that handles array values
- Set `enableSorting: false` and `enableHiding: false` on image/actions columns
- Data is fetched with `limit: 100` for client-side pagination/filtering/sorting
- Use `DataTableSkeleton` for initial loading state (before data arrives)

#### Spinner Component

For loading states, use the `Spinner` component located at `src/components/ui/spinner.tsx`.

**Usage:**

```tsx
import { Spinner } from "@/components/ui/spinner";

// Basic usage
<Spinner />

// With custom size
<Spinner className="size-5" />

// Centered spinner
<Spinner className="size-5 mx-auto" />
```

**Common Patterns:**

```tsx
// Loading state with tRPC
const { data, isLoading } = api.post.getStatistics.useQuery();

return <div>{isLoading ? <Spinner className="size-5 mx-auto" /> : <div>{data?.value}</div>}</div>;
```

**Props:**

- Accepts all standard SVG props
- `className`: Custom Tailwind classes (default: `size-4 animate-spin`)
- Automatically includes `role="status"` and `aria-label="Loading"` for accessibility
