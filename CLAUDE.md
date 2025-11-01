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

### UI Components

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
