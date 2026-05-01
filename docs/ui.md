# UI Coding Standards

## Component Library

All UI must be built exclusively with [shadcn/ui](https://ui.shadcn.com/) components.

- **Do not create custom components.** If a UI element is needed, find the appropriate shadcn component and install it via `npx shadcn@latest add <component>`.
- **Do not use raw HTML elements** for UI primitives (buttons, inputs, dialogs, etc.) — always reach for the shadcn equivalent.
- **Do not install or use any other component library** (e.g. MUI, Chakra, Headless UI).

All installed components live in `src/components/ui/`. Do not modify these files unless absolutely necessary — shadcn components are meant to be used as-is or composed together.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/). Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other formatting method.

Dates displayed to the user must follow this format:

| Date | Formatted Output |
|---|---|
| 2025-09-01 | 1st Sep 2025 |
| 2025-08-02 | 2nd Aug 2025 |
| 2026-01-03 | 3rd Jan 2026 |
| 2024-06-04 | 4th Jun 2024 |

Use the `date-fns` format string `do MMM yyyy` to produce this output:

```ts
import { format } from 'date-fns';

format(date, 'do MMM yyyy'); // "1st Sep 2025"
```
