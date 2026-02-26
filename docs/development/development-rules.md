# Development Rules & Coding Standards

> **Mandatory Protocol**: All code contributions must adhere to these standards to ensure maintainability, scalability, and consistency across the EIP platform.

## 1. Naming Conventions

Consistency reduces cognitive load. Follow these patterns strictly.

| Entity | Case Style | Example | Rule |
| :--- | :--- | :--- | :--- |
| **Files** | `kebab-case` | `user-profile.tsx`, `auth-utils.ts` | All file names must be lowercase with hyphens. |
| **Directories** | `kebab-case` | `src/features/user-profile/` | Feature directories should be descriptive. |
| **Components** | `PascalCase` | `UserProfileCard`, `SubmitButton` | Must match the file name (if default export). |
| **Functions** | `camelCase` | `getUserProfile`, `handleSubmit` | Verbs first (get, set, fetch, handle). |
| **Variables** | `camelCase` | `isLoading`, `userData` | Boolean should start with `is`, `has`, `should`. |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_URL` | Only for true constants (configuration). |
| **Types/Interfaces** | `PascalCase` | `User`, `AuthResponse` | Do not prefix with `I` (e.g., `IUser`). |
| **Zod Schemas** | `camelCase` | `userSchema`, `loginFormSchema` | Suffix with `Schema`. |

---

## 2. Component Structure

Every React component should follow a consistent internal structure.

```typescript
// 1. Imports (Grouped: External -> Internal -> Styles)
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";

// 2. Types/Interfaces (Props)
interface UserCardProps {
  userId: string;
  variant?: "default" | "compact";
}

// 3. Component Definition (Named Export preferred for discoverability)
export function UserCard({ userId, variant = "default" }: UserCardProps) {
  // 4. Hooks (State, Query, Form)
  const { data, isLoading } = useQuery({ queryKey: ["user", userId], queryFn: () => fetchUser(userId) });
  
  // 5. Derived State
  const displayName = data?.fullName || "Guest";

  // 6. Event Handlers
  const handleClick = () => {
    console.log("Clicked");
  };

  // 7. Loading/Error States
  if (isLoading) return <Skeleton className="h-10 w-full" />;

  // 8. Render
  return (
    <div className="p-4 border rounded">
      <h1>{displayName}</h1>
      <Button onClick={handleClick}>View Profile</Button>
    </div>
  );
}
```

---

## 3. State Management Strategy

We use a tiered approach to state management to keep the app performant and predictable.

### Tier 1: URL State (Single Source of Truth)
*   **Use for**: Search params, filters, pagination, active tabs, modal visibility (optional).
*   **Why**: Shareable URLs, browser history support.
*   **Tool**: `useSearchParams` (Next.js) or `nuqs` (Type-safe search params).

### Tier 2: Server State (TanStack Query)
*   **Use for**: Async data from DB/API.
*   **Why**: Caching, deduplication, background updates, optimistic updates.
*   **Rule**: NEVER store server data in `useState` unless you are transforming it for a specific UI interaction that doesn't persist.

### Tier 3: Local UI State (useState / useReducer)
*   **Use for**: Form inputs (controlled components), toggle states (isExpanded), hover states.
*   **Rule**: Keep it as close to the leaf component as possible (Colocation).

### Tier 4: Global Client State (Zustand)
*   **Use for**: Complex interactive flows (e.g., Multi-step Proposal Builder, Shopping Cart).
*   **Rule**: Avoid unless absolutely necessary.

---

## 4. Data Fetching & Mutations

We use **TanStack Query** as the standard for data synchronization.

### 4.1 Queries (Fetching)
*   **Server Components**: Fetch directly via DB/DAL (Data Access Layer) for initial SEO/HTML.
*   **Client Components**: Use `useQuery` to hydrate or fetch data on interaction.
*   **Keys**: Use strictly typed Query Keys factories (to be defined in `src/lib/query-keys.ts` or per feature).

```typescript
// Bad
useQuery({ queryKey: ["users"], ... })

// Good
useQuery({ queryKey: queryKeys.users.list(filters), ... })
```

### 4.2 Mutations (Server Actions)
*   **Implementation**: All mutations (Create/Update/Delete) MUST be implemented as **Server Actions**.
*   **Client Usage**: Use `useMutation` from TanStack Query to wrap Server Actions.
*   **Why**: Gives us `isPending`, `onError`, `onSuccess` states automatically.

```typescript
const { mutate } = useMutation({
  mutationFn: createUserAction, // Server Action
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    toast.success("User created");
  }
});
```

---

## 5. Type Safety & Validation

*   **Strict Mode**: `tsconfig.json` must have `strict: true`.
*   **No `any`**: Explicitly define types. Use `unknown` if type is truly ambiguous.
*   **Zod**: Use Zod for ALL runtime validation (Forms, API inputs, URL params).
    *   Server Actions must validate `input` using Zod before processing.

---

## 6. Error Handling

*   **Server Actions**: Return `{ success: boolean, error?: string, data?: T }` pattern. Do not throw errors to the client unless caught by an Error Boundary.
*   **UI**: Use `toast` (Sonner) for user feedback.
*   **Logging**: Log unexpected errors to console (server-side) or monitoring service.

---

## 7. Git Workflow

*   **Branches**: `feature/name`, `fix/issue`, `chore/maintenance`.
*   **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`).
*   **PRs**: Small, focused PRs are better than massive ones.

---

## 8. Lint Fixing Rules

### 8.1 Core Principles
*   **Fix errors before warnings**: Resolve blocking lint errors first, then clean up warnings.
*   **Small-scope changes**: Fix one category or module at a time to avoid wide cross-cutting edits.
*   **Avoid unnecessary files**: Edit existing files unless the requirement explicitly needs a new one.

### 8.1.1 Lint 規範撰寫提醒
*   **避免 unused**: 刪除未使用的 import、變數、型別與 props。
*   **避免 any**: 優先使用現有 schema / types / db schema 的型別，必要時用 unknown。
*   **React Hooks**: 依規則補齊依賴、避免在 effect 內同步 setState。
*   **字串轉義**: JSX 內的引號使用 &quot; 或 &apos;，避免未轉義字元。
*   **表單解析**: zodResolver 與 react-hook-form 型別對齊，避免型別警告。
*   **匯入整理**: 先整理使用到的圖示與 UI 元件，避免殘留未用匯入。

### 8.2 no-explicit-any Strategy
*   **Prefer existing types**: Check types.ts / schema / zod schema for reusable types first.
*   **Test files**: Use `unknown` casts to a named type instead of `any`.
*   **Forms and resolvers**: Use typed resolvers for react-hook-form + zodResolver.
*   **Relation data**: Use relation-specific types (e.g., `QuoteWithRelations`) instead of `any`.

### 8.3 no-unused-vars Cleanup
*   **Remove unused imports**: Delete unused UI components or schema imports.
*   **Keep only required side effects**: Retain imports only if they are used for side effects.

### 8.4 react-hooks/set-state-in-effect
*   **Avoid synchronous setState in effects**: Replace with derived state or event-driven updates.
*   **Default value initialization**: Initialize dialog form state on open via onOpenChange.
*   **Auto-expand on search**: Derive auto-expanded sets with useMemo and choose the visible set at render time.

### 8.5 Test Mock Guidelines
*   **Avoid any**: Cast mocks from `unknown` to a concrete signature.
*   **Match real return shapes**: mockResolvedValue objects must align with actual types.
*   **Explicit error assertions**: Assert success/error branches explicitly in tests.

---

## 9. Next.js 15+ Specifics

### 9.1 Async Params & SearchParams
In Next.js 15+, `params` and `searchParams` in Page components are Promises. You MUST await them before accessing their properties.

**Correct:**
```typescript
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page;
  // ...
}
```

**Incorrect:**
```typescript
interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params, searchParams }: PageProps) {
  const id = params.id; // Error: params is a Promise
  const page = searchParams.page; // Error: searchParams is a Promise
  // ...
}
```
