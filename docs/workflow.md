# Development Workflow & Protocol

> **Mandatory Protocol**: This workflow must be strictly followed for every development session to ensure consistency, memory persistence, and code quality.

## 🏁 Quick Checklist (Start Here)
1.  [ ] **Read Context**: `docs/progress/active_context.md` & `docs/progress/product_state.md`.
2.  [ ] **Plan**: Create/Update Todo list.
3.  [ ] **Branch**: Create a new feature branch (`git checkout -b feature/<name>`).
4.  [ ] **Code**: Implement following Feature-Base principles.
5.  [ ] **UI Integration**: Ensure feature is linked in Menu/UI for user access.
6.  [ ] **Test**: Write and pass Unit Tests (Mandatory).
7.  [ ] **Verify**: Manual verification (User).
13. [ ] **Lint**: Run `pnpm lint` to ensure no errors or warnings before commit.
14. [ ] **Report**: Proactively update `docs/progress/*` files upon completion.
15. [ ] **Handover**: Commit changes; DO NOT merge to main.

---

## 1. Phase 1: Initialization (Context Loading)
**Goal**: Align with the project's current state before writing a single line of code.

1.  **Read Active Context**:
    - Open `docs/progress/active_context.md`.
    - Understand the `Current Focus` and `Next Steps` left by the previous session.
2.  **Check Feature Status**:
    - If working on a specific feature, check `docs/progress/product_state.md` to see its current status and dependencies.
3.  **Review Guidelines**:
    - If unsure about architectural rules, consult `docs/README.md` (Feature Base) or `docs/progress/AI_CONTEXT_GUIDELINE.md` (Memory).

## 2. Phase 2: Planning
**Goal**: Define clear objectives for the current session.

1.  **Define Goal**: What is the specific outcome of this session? (e.g., "Implement Login UI" or "Fix Auth Bug").
2.  **Update Active Context (Start)**:
    - Edit `docs/progress/active_context.md`.
    - Update the **Current Focus** section with your new goal.
3.  **Create Todos**:
    - Use the `TodoWrite` tool to list granular tasks.
4.  **Create Branch**:
    - Create a new branch for the feature: `git checkout -b feature/<feature-name>`
    - Keep branch names descriptive (e.g., `feature/auth-login`, `fix/admin-access`).

## 3. Phase 3: Implementation (The Cycle)
**Goal**: Write high-quality, maintainable code.

1.  **Feature-Base Adherence**:
    - Ensure code is placed in the correct `src/features/<feature-name>` directory.
    - Do not leak feature logic into global `src/shared` unless strictly necessary.
2.  **UI Integration (Mandatory)**:
    - **Menu Integration**: Always add the feature to the Dashboard Menu or relevant navigation.
    - **Workflow Linking**: Ensure the feature is connected to other parts of the system (e.g., "Create Quote" from "Client Profile").
    - **User Access**: The feature must be easily accessible to the user via the UI.
3.  **Package Management**:
    - **Strict Rule**: ALWAYS use `pnpm add` to install packages.
    - **Prohibited**: Do NOT use `npm install` or `yarn add`.
4.  **Atomic Steps**:
    - Make small, verifiable changes.
    - Avoid "Big Bang" refactors without a backup plan.
5.  **Consult Decision Log**:
    - If making an architectural choice, check `docs/progress/decision_log.md` to see past decisions.

### 3.5 Database Management Strategy (Supabase + Drizzle)
**Goal**: Maintain a stable, secure, and reproducible database schema with RLS and seed data.

#### A. RLS (Row Level Security) Protocol
- **Mandatory RLS**: All new tables MUST have RLS enabled.
- **Schema Definition**: Define RLS policies directly in the Drizzle schema file using `pgPolicy` to prevent accidental disabling during migrations.
- **Example**:
  ```typescript
  import { pgTable, pgPolicy } from "drizzle-orm/pg-core";
  import { sql } from "drizzle-orm";

  export const users = pgTable("users", {
    // ... columns
  }, (table) => [
    pgPolicy("Users can view own profile", {
      for: "select",
      using: sql`auth.uid() = ${table.id}`,
    }),
  ]);
  ```

#### B. Migration Protocol (No `db reset`)
- **Prohibited**: Do NOT use `supabase db reset` as it wipes data.
- **Workflow**:
  1.  **Generate Migration**: Use `drizzle-kit generate` with a meaningful name.
      ```bash
      npx drizzle-kit generate --name <feature_name>_<action>
      # Example: npx drizzle-kit generate --name notifications_add_read_status
      ```
  2.  **Review SQL**: Check the generated SQL file in `supabase/migrations` to ensure correctness (especially RLS policies).
  3.  **Apply Migration**: Apply changes to the database.
      ```bash
      npx drizzle-kit migrate
      # Or if using Supabase CLI: npx supabase migration up
      ```

#### C. Seeding Strategy
- **Per-Feature Seeds**: Create a dedicated seed script for each feature in `scripts/seeds/`.
- **Naming Convention**: `scripts/seeds/<feature-name>.ts`.
- **Execution**: Run the seed script to populate initial test data.
  ```bash
  npx tsx scripts/seeds/notifications.ts
  ```

### 3.6 Client-Side Data Strategy (TanStack Query)
**Goal**: Efficiently manage async server state on the client.

- **Installation**: Ensure `@tanstack/react-query` is used for client-side fetching.
- **Pattern**:
    - **Fetching**: Use `useQuery` for GET requests (wrapped around Server Actions or API calls).
    - **Mutating**: Use `useMutation` for POST/PUT/DELETE requests (wrapped around Server Actions).
- **Optimistic UI**: Implement optimistic updates for instant feedback on simple actions (e.g., "Like", "Mark as Read").
- **Query Keys**: Define keys in a dedicated `keys.ts` or `query-keys.ts` file within the feature directory to avoid collisions.

## 4. Phase 4: Testing & Verification (Strict Gate)
**Goal**: Ensure code correctness before user review.

### 4.1 Unit Testing Structure (Feature-Based)
**Goal**: Maintain tests close to the implementation for better discoverability and refactoring.

- **Placement**: Unit tests MUST be placed in the same directory as the file they are testing.
- **Naming Convention**: `<filename>.test.ts` or `<filename>.spec.ts`.
- **Directory Structure Example**:
  ```text
  src/features/notifications/
  ├── components/
  │   ├── notification-bell.tsx
  │   └── notification-bell.test.tsx  # UI Component Test
  ├── server/
  │   ├── actions.ts
  │   └── actions.test.ts             # Server Actions Test
  └── utils/
      ├── format-date.ts
      └── format-date.test.ts         # Utility Test
  ```

1.  **Self-Correction**: Check for linting errors or type mismatches immediately.
2.  **Unit Testing (Mandatory)**:
    - **Rule**: Every completed feature MUST have corresponding unit tests.
    - Ensure all tests pass (`pnpm test` or equivalent).
    - **Note**: Only proceed to manual verification after tests are green.
3.  **Manual Verification**:
    - Hand over to the User for browser testing.
    - User decides when to approve.

### 4.2 Linting & Static Analysis (Pre-Commit Gate)
**Goal**: Ensure the codebase remains clean and follows established standards.

1.  **Run Lint**: Execute `pnpm lint` (or `npm run lint` if pnpm is not configured for lint) before every commit.
2.  **Zero Tolerance**: All errors AND warnings must be resolved.
3.  **No Bypass**: Do not use `--no-verify` to bypass git hooks if they are configured.

## 5. Phase 5: Documentation & Reporting (Memory Sync)
**Goal**: Dump "Working Memory" into "External Storage" for the next AI/Developer.

> **CRITICAL STEP**: Failure to do this results in context loss.

1.  **Proactive Progress Update**:
    - **Immediate Action**: As soon as a feature is implemented, update `docs/progress/active_context.md` and `docs/progress/product_state.md`.
    - **Don't Wait**: Do not wait for the user to ask for documentation updates.
2.  **Update `active_context.md`**:
    - **Recent Changes**: List files modified and key changes made.
    - **Next Steps**: Update the todo list for the *next* session.
    - **Open Questions**: Log any blockers.
3.  **Update `product_state.md`**:
    - If a feature is completed, change status from `In Progress` to `Done`.
4.  **Update `decision_log.md`**:
    - If you made a significant technical decision (e.g., "Chose Library X over Y"), log it.
5.  **Git Commit (No Merge)**:
    - Stage changes: `git add .`
    - Commit: `git commit -m "feat(scope): description"` (Follow Conventional Commits).
    - **STOP**: Do NOT merge to `main`.
    - Inform the User that the branch is ready for review.

---

## 6. Handling Interruptions
If the user interrupts or redirects the task:
1.  Quickly save the current state to `active_context.md` under a "Paused Work" section.
2.  Pivot to the new request.
