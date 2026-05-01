# Data Fetching Standards

## Server Components Only

All data fetching must be done exclusively in **Server Components**.

- **Do not** fetch data in Client Components (`'use client'`)
- **Do not** fetch data via Route Handlers (`src/app/api/`)
- **Do not** use `useEffect`, `SWR`, `React Query`, or any client-side fetching pattern
- **Do not** use Server Actions to fetch and return data

Data flows in one direction: Server Component → passes data as props → Client Component (for interactivity only).

## DB Query Helper Functions

All database queries must be written as helper functions inside the `src/data/` directory.

- **Do not** write Drizzle queries inline inside page or layout files
- **Do not** use raw SQL — always use the Drizzle ORM query API
- One file per domain area (e.g. `src/data/workouts.ts`, `src/data/exercises.ts`)

Example structure:

```ts
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function getWorkoutsForDate(userId: string, date: Date) {
  // ...drizzle query
}
```

Server Components then call these helpers directly:

```tsx
// src/app/dashboard/page.tsx (Server Component)
import { getWorkoutsForDate } from '@/data/workouts';

export default async function DashboardPage() {
  const workouts = await getWorkoutsForDate(userId, date);
  // ...
}
```

## Data Ownership & Security

This is the most critical rule: **a logged-in user must only ever be able to access their own data.**

Every query helper that returns user-owned data **must**:

1. Accept `userId` as an explicit parameter
2. Always include `eq(table.userId, userId)` as a `where` condition
3. Never expose a version of the function that omits the `userId` filter

```ts
// CORRECT — userId is always scoped into the query
export async function getWorkoutsForDate(userId: string, date: Date) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), ...));
}

// WRONG — never expose an unscoped query
export async function getAllWorkouts() {
  return db.select().from(workouts); // ❌ no userId filter
}
```

The `userId` passed to these helpers must always come from `auth()` (Clerk) on the server — never from URL params, search params, request bodies, or any client-supplied value.

```tsx
// src/app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const workouts = await getWorkoutsForDate(userId, date); // ✅ userId from auth()
}
```
