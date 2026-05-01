# Data Mutation Standards

## DB Mutation Helper Functions

All database mutations must be written as helper functions inside the `src/data/` directory, co-located with query helpers for the same domain.

- **Do not** write Drizzle mutations inline inside Server Actions, pages, or any other file
- **Do not** use raw SQL — always use the Drizzle ORM API
- One file per domain area (e.g. `src/data/workouts.ts`, `src/data/exercises.ts`)

```ts
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(userId: string, data: NewWorkout) {
  return db.insert(workouts).values({ ...data, userId }).returning();
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Server Actions

All mutations triggered from the UI must go through Server Actions.

- **Do not** mutate data via Route Handlers (`src/app/api/`)
- **Do not** mutate data directly inside Server Components or Client Components
- Server Actions must be defined in colocated `actions.ts` files, adjacent to the page or feature they serve

```
src/app/dashboard/
├── page.tsx
├── actions.ts        ✅ colocated server actions
└── WorkoutForm.tsx
```

## Typed Parameters — No FormData

Server Action parameters must be explicitly typed. `FormData` is **never** an acceptable parameter type.

```ts
// CORRECT — typed parameters
export async function createWorkoutAction(data: CreateWorkoutInput) { ... }

// WRONG — FormData is not allowed
export async function createWorkoutAction(formData: FormData) { ... } // ❌
```

If the action is invoked from a form, extract and validate the values in the Client Component before calling the action, then pass typed values as arguments.

## Zod Validation

Every Server Action **must** validate its arguments with Zod before touching the database.

```ts
// src/app/dashboard/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createWorkout } from '@/data/workouts';

const CreateWorkoutSchema = z.object({
  date: z.string().date(),
  notes: z.string().max(500).optional(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(data: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const parsed = CreateWorkoutSchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid input');

  return createWorkout(userId, parsed.data);
}
```

## Data Ownership & Security

The same rules that apply to queries apply to mutations: **a user must only ever be able to mutate their own data.**

Every mutation helper in `src/data/` that operates on user-owned data **must**:

1. Accept `userId` as an explicit parameter
2. Always include `eq(table.userId, userId)` in the `where` clause for updates and deletes
3. Always set `userId` from the parameter on inserts — never trust a client-supplied value

The `userId` passed to mutation helpers must always come from `auth()` (Clerk) inside the Server Action — never from the action's arguments, URL params, or any client-supplied value.

```ts
// src/app/dashboard/actions.ts
export async function deleteWorkoutAction(workoutId: string) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  // userId comes from auth() — never from the action argument
  await deleteWorkout(userId, workoutId); // ✅
}
```

```ts
// src/data/workouts.ts
export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId), // ✅ always scope to userId
      )
    );
}
```
