# Auth Coding Standards

## Provider

This app uses [Clerk](https://clerk.com/) for authentication. Do not implement a custom auth solution or install any other auth library (e.g. NextAuth, Auth.js, Lucia).

## ClerkProvider

`<ClerkProvider>` must wrap the entire app. It lives in the root layout and must not be moved or duplicated:

```tsx
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Middleware (Route Protection)

Route protection is handled by `clerkMiddleware()` in `src/proxy.ts`. This runs on every request matching the configured matchers.

- **Do not** use `authMiddleware` — it is deprecated.
- **Do not** rename `proxy.ts` back to `middleware.ts` — Next.js 16 renamed the file and the export.

```ts
// src/proxy.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
```

## Getting the Current User (Server)

On the server, always use `auth()` from `@clerk/nextjs/server` to obtain the current user's ID. Never trust a `userId` from URL params, search params, request bodies, or any client-supplied source.

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  // pass userId to data helpers
}
```

- **Do not** call `auth()` in Client Components — it is a server-only API.
- Always redirect unauthenticated users immediately; never render protected content conditionally in place of a redirect.

## UI Components (Client)

Use Clerk's pre-built components for sign-in/sign-up UI and the user button. Do not build custom auth forms.

| Component | Purpose |
|---|---|
| `<SignInButton mode="modal" />` | Triggers the Clerk sign-in modal |
| `<SignUpButton mode="modal" />` | Triggers the Clerk sign-up modal |
| `<UserButton />` | Avatar/dropdown for the signed-in user |
| `<Show when="signed-in">` | Renders children only when authenticated |
| `<Show when="signed-out">` | Renders children only when unauthenticated |

All components are imported from `@clerk/nextjs` (not `@clerk/nextjs/server`).

```tsx
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';

<Show when="signed-out">
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Import Paths

| What | Import from |
|---|---|
| Client components (`ClerkProvider`, `SignInButton`, etc.) | `@clerk/nextjs` |
| Server utilities (`auth()`, `clerkMiddleware()`) | `@clerk/nextjs/server` |
