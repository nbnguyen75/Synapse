---
name: refactor
description: Backend refactoring, SRP enforcement, multi-trip DB query elimination, route acquisition, and clean layer separation for Hono, Drizzle ORM, and TypeScript. Use when auditing, refactoring, or splitting bloated backend modules, checking function naming accuracy, eliminating N+1 queries, untangling business logic from HTTP transport, and organizing sub-feature route acquisition.
---

# Backend Refactoring & Optimization Playbook

A practical, actionable guide for identifying backend smells, enforcing Single Responsibility Principle (SRP) across layers, ensuring semantic function naming, minimizing database round-trips, organizing sub-feature route aggregation, eliminating redundant DTOs/return types via TypeScript type inference (`Awaited<ReturnType<typeof ...>>`), pruning dead code, and maintaining minimal public facades in `index.ts`.

---

## Part 1: Backend Smells — When to Refactor & Split

Split and refactor backend modules when one or more of the following triggers occur.

### 1. File Length & Complexity Limits

- **`routes.ts`**: Exceeds **120–150 lines** or contains business rules, calculation logic, or direct database orchestration beyond input validation, service dispatching, and response mapping.
- **`service.ts`**: Exceeds **200–250 lines** or juggles multiple unrelated business workflows.
- **`repository.ts`**: Exceeds **200 lines** or handles queries across unrelated aggregate domains.
- **Action**: Extract submodules into vertical domain slices under `src/features/<feature>/<submodule>/` or split into focused functional helpers.

### 2. Redundant DTO & Explicit Return Type Bloat (Type Maintenance Smell)

- **Smell**: Writing manual return types or repetitive DTO interfaces for every repository and service function (e.g. `UserSelectDto`, `NoteItemResponseDto`), causing cascading maintenance overhead every time a column in `select` / `columns` is added, removed, or modified.
- **Rule**:
   - **Do NOT declare explicit return types on functions unless strictly necessary** (e.g. complex recursion, public cross-service library contracts, or discriminated union errors).
   - **Rely on TypeScript type inference**: Let Drizzle ORM and TypeScript infer the exact shape of repository outputs automatically.
   - **Refer types directly from functions** using `Awaited<ReturnType<typeof func>>` or `ReturnType<typeof func>` instead of hand-crafting synthetic DTOs:
      ```ts
      // ✅ Infer type directly from function output
      export type UserRecord = Awaited<ReturnType<typeof findUserById>>;
      ```

### 3. Function Naming & Intent Alignment (Semantic Accuracy Smell)

- **Smell**: Function names that are vague, misleading, or do not accurately reflect the single operation they perform (e.g., `processData`, `handleTask`, `checkAndSave`, or a function named `getNote` that silently updates a timestamp or creates a record).
- **Rule**:
   - Every function name must explicitly and honestly describe its single intent.
   - **Repository**: Query/persistence verbs (`findUserById`, `listNotesByUserId`, `batchInsertTasks`, `updateHabitStreak`, `deleteConversationRecord`).
   - **Service**: Domain workflow verbs (`createNoteWorkflow`, `changeUserEmail`, `checkInHabit`, `calculateAiUsage`).
   - **Boolean / Guard**: Predicate prefixes (`hasActiveSubscription`, `isOwner`, `canAccessConversation`).

### 4. Multi-Trip & N+1 Database Queries (Performance Smell)

- **Smell**: Looping queries (`for (const id of ids) { await db.select()... }`), or performing multiple sequential queries that could be handled in **1 single query / round-trip** (e.g., using `inArray`, batch inserts/updates, CTEs, or subqueries).
- **Action**:
   - Consolidate multi-step queries into single batch statements (`inArray(table.id, ids)`).
   - Use Drizzle transactions (`db.transaction()`) only when atomic multi-table integrity is required.
   - Return aggregated data from the repository in a single query with joins/subqueries rather than issuing multiple round-trips from the service.

### 5. Routes vs. Service vs. Repository Responsibilities

- **`routes.ts` Responsibility**:
   - Handles HTTP transport, input validation (`zValidator`), invoking service functions, and deciding the response envelope.
   - **Export Standard**: `routes.ts` **MUST `export default`** the Hono router instance (e.g., `export default notesRoutes;` or `export default aiRoutes;`).
   - Decides the HTTP status and payload response based on service results (e.g., if finding by ID returns `null` or `{ success: false }`, route returns 404 with standard error JSON structure or throws HTTP exception; if successful, returns data directly with 200 OK without needing explicit status code declaration when default).
- **`service.ts` Responsibility**:
   - Pure business logic, workflow calculation, and data orchestration.
   - **MUST NOT throw API / HTTP errors or depend on Hono / HTTP frameworks.**
   - Returns raw domain entities, nullable values (`T | null`), or discriminated unions (`{ success: true; data: T } | { success: false; error: ... }`).
- **`repository.ts` Responsibility**:
   - Pure Drizzle ORM persistence. Executes 1 and only 1 database query/mutation per function in minimal round-trips.

### 6. Main Feature Route Acquisition & Sub-Feature Mounting

- **Rule**: For composite domain features containing sub-features (e.g. `src/features/ai/` with `chat`, `conversation`, `settings`, `keys`, `skills`):
   - The **Main Feature `routes.ts`** (`src/features/<feature>/routes.ts`) acquires/mounts all sub-feature routes via `.route('/sub-path', subFeatureRoutes)`.
   - The **Main Feature `index.ts`** exposes the aggregated router via `export { default as <feature>Routes } from './routes';`.
   - **`src/index.ts`** imports and mounts ONLY the main feature routes at `/api/v1/<feature>`, avoiding scattered sub-feature mounts directly at root app level.

```text
src/
  features/
    ai/
      chat/routes.ts           --> exports default chatRoutes
      conversation/routes.ts   --> exports default conversationRoutes
      routes.ts                --> acquires .route('/chat', chatRoutes), .route('/conversations', conversationRoutes) & exports default aiRoutes
      index.ts                 --> exports { default as aiRoutes } from './routes'
  index.ts                     --> mounts app.route('/api/v1/ai', aiRoutes)
```

### 7. Single Responsibility Principle (SRP) per Function

- **Rule**: **Every function in `repository.ts` and `service.ts` must have 1 and only 1 responsibility.**
   - **Repository functions**: Execute exactly one query/mutation task (e.g., `findNoteById`, `batchUpdateTaskStatus`, `createNoteRecord`). Zero business logic, zero calculations.
   - **Service functions**: Orchestrate exactly one business workflow by coordinating domain validation and repository calls. Zero direct Drizzle queries, zero HTTP response creation.

### 8. Explicit & Minimal Exports in `index.ts` (Zero Unused Exports, No `*`)

- **Rule**:
   - **Expose ONLY what is actively consumed**: `index.ts` (at feature root or submodule level) MUST only export functions, types, schemas, or routes that are **actually imported and used** by other features or sub-features.
   - **TUYỆT ĐỐI KHÔNG dùng wildcard export (`export * from ...`)**: All exports must be explicit (`export { funcA, type TypeB }`).
   - **Xóa bỏ các exports không dùng**: Any symbol in `index.ts` not imported by external modules must be deleted from `index.ts` to keep the public boundary lean and clean.

### 9. Dead Code Elimination (Delete Instead of Commenting Out)

- **Rule**: **Delete unused code immediately**. Do not comment out dead code, obsolete functions, or unused variables.
- Git history maintains version tracking—dead code must be deleted completely from codebase files to prevent mental load and code bloat.

---

## Part 2: Layer Boundaries & Architecture Rules

```
src/
  features/
    <feature>/
      index.ts           # Public API facade (ONLY actively used exports, NO export *, delete unused)
      routes.ts          # Main feature router (export default), acquires sub-feature routes
      service.ts         # Pure domain logic and orchestration (ZERO HTTP dependencies)
      repository.ts      # Drizzle ORM queries (inferred return types, optimized minimal round-trips)
      schemas.ts         # Zod v4 schemas (input/output validation)
      types.ts           # Inferred domain types & result unions (Awaited<ReturnType<...>>)
      <submodule>/       # Sub-domain modules (e.g., src/features/ai/chat/)
        index.ts         # Submodule public API facade (ONLY exports used by sibling submodules or feature root)
        routes.ts        # Sub-feature router (export default)
        service.ts
        repository.ts
```

### Layer Separation Matrix

| Layer               | Responsibility                                                                                                                 | Export / Import Rules                                                               | Strict Prohibitions                                                               |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **`routes.ts`**     | Request validation (Zod v4), invoking service, mapping domain outcomes to HTTP responses (404, 400, 200). Acquires sub-routes. | **`export default router`**, non-relative `@/...` imports                           | Direct DB queries, business calculation logic.                                    |
| **`service.ts`**    | Orchestrates domain operations, applies business rules, computes domain state.                                                 | Standalone functions without redundant return types                                 | **Hono**, `HTTPException`, `c.json()`, HTTP status codes, SQL queries.            |
| **`repository.ts`** | Direct database persistence via Drizzle ORM, optimized single-round-trip queries, batch queries.                               | Standalone functions with inferred return types                                     | HTTP objects, business orchestration, cross-domain table joins, manual DTO types. |
| **`schemas.ts`**    | Runtime schema definitions and input/output validation contracts via Zod v4 (`zod/v4`).                                        | Standalone exported schemas (`export const ...`)                                    | Business logic, DB drivers, Hono handlers.                                        |
| **`types.ts`**      | Domain type definitions inferred from repository/service (`Awaited<ReturnType<...>>`) and result unions.                       | Inferred type exports (`export type ...`)                                           | Executable runtime code, duplicate manual DTO interfaces.                         |
| **`index.ts`**      | Public facade for feature or submodule.                                                                                        | Explicit minimal exports (`export { funcA, type TypeB }`) of ONLY consumed symbols. | `export *`, exporting unused private helpers, commented-out dead code.            |

---

## Part 3: Concrete Refactoring Patterns

### 1. Inferred Types & No Redundant DTOs Pattern

#### ❌ BAD: Manual boilerplate DTOs and verbose return types

```ts
// ❌ BAD: Redundant manual DTO interface that breaks whenever selected columns change
export interface UserProfileDto {
	id: string;
	email: string;
	fullName: string | null;
}

export async function findUserProfile(id: string): Promise<UserProfileDto | null> {
	const result = await db.query.users.findFirst({
		where: eq(users.id, id),
		columns: { id: true, email: true, fullName: true }
	});
	return result ?? null;
}
```

#### ✅ GOOD: Inferred return types & type derivation

```ts
// 1. repository.ts (Let TypeScript & Drizzle infer the exact query output)
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

// No redundant Promise<UserProfileDto | null> return annotation needed
export async function findUserProfile(id: string) {
	const user = await db.query.users.findFirst({
		where: eq(users.id, id),
		columns: { id: true, email: true, fullName: true }
	});
	return user ?? null;
}

// 2. types.ts (Derive type directly from repository function if needed elsewhere)
export type UserProfile = Awaited<ReturnType<typeof findUserProfile>>;
```

---

### 2. Routes and Service Separation Pattern with `export default`

```ts
// 1. repository.ts (Single DB round-trip query, SRP, inferred return type)
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { notes } from '@/db/schema';

export async function findNoteByIdFromDb(userId: string, noteId: string) {
	return await db.query.notes.findFirst({
		where: and(eq(notes.userId, userId), eq(notes.id, noteId))
	});
}
```

```ts
// 2. service.ts (Pure domain logic, ZERO HTTP errors thrown, inferred return type)
import { findNoteByIdFromDb } from '@/features/notes/repository';

export async function getNoteById(userId: string, noteId: string) {
	// Clear, honest naming matching its single responsibility
	return await findNoteByIdFromDb(userId, noteId);
}
```

```ts
// 3. routes.ts (Receives service result, handles response & status codes, EXPORTS DEFAULT)
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { Hono } from 'hono';

import { ERROR_CODES } from '@/constants/error-codes';
import { requireAuth, type AuthContextVariables } from '@/middleware/auth';
import { getNoteById } from '@/features/notes/service';

const notesRoutes = new Hono<{ Variables: AuthContextVariables }>();

notesRoutes.use('*', requireAuth);

notesRoutes.get('/:id', async (c) => {
	const user = c.get('user');
	const id = c.req.param('id');
	const note = await getNoteById(user.id, id);

	// Routes layer decides 404 when not found
	if (!note) {
		return c.json(
			{
				details: null,
				errorCode: ERROR_CODES.NOTE_NOT_FOUND,
				message: 'Note not found or access denied',
				success: false,
				timestamp: new Date().toISOString(),
				title: ReasonPhrases.NOT_FOUND
			},
			StatusCodes.NOT_FOUND
		);
	}

	// 200 OK is Hono's default, returns clean response
	return c.json(note);
});

export default notesRoutes;
```

---

### 3. Main Feature & Sub-Feature Route Acquisition Pattern

```ts
// src/features/ai/routes.ts
import { Hono } from 'hono';
import { requireAuth } from '@/middleware/auth';
import chatRoutes from '@/features/ai/chat/routes';
import conversationRoutes from '@/features/ai/conversation/routes';
import aiKeyRoutes from '@/features/ai/keys/routes';
import aiSettingsRoutes from '@/features/ai/settings/routes';
import aiSkillRoutes from '@/features/ai/skills/routes';

const aiRoutes = new Hono();

aiRoutes.use('*', requireAuth);

// Main feature acquires all sub-feature routers
aiRoutes.route('/chat', chatRoutes);
aiRoutes.route('/conversations', conversationRoutes);
aiRoutes.route('/keys', aiKeyRoutes);
aiRoutes.route('/settings', aiSettingsRoutes);
aiRoutes.route('/skills', aiSkillRoutes);

export default aiRoutes;
```

```ts
// src/features/ai/index.ts (Exposes ONLY public facade needed externally)
export { extractNoteReminder } from '@/features/ai/generator';
export { default as aiRoutes } from './routes';
```

```ts
// src/index.ts (Mounts main feature router cleanly)
import { aiRoutes } from '@/features/ai';

app.route('/api/v1/ai', aiRoutes);
```

---

### 4. Database Optimization: Batch Queries vs. Multi-Trip Loops

#### ❌ BAD: Loop queries (N+1 round-trips)

```ts
// ❌ BAD: N round-trips across database network connection
export async function updateTaskStatuses(items: { id: string; status: string }[]) {
	for (const item of items) {
		await db.update(tasks).set({ status: item.status }).where(eq(tasks.id, item.id));
	}
}
```

#### ✅ GOOD: 1 Single Round-Trip Batch Query

```ts
// ✅ GOOD: 1 single round-trip using inArray
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';

export async function batchUpdateTaskStatus(ids: string[], status: string) {
	if (ids.length === 0) return;

	await db.update(tasks).set({ status, updatedAt: new Date() }).where(inArray(tasks.id, ids));
}
```

---

## Part 4: Refactoring Checklist

- [ ] **No Redundant Return Types / DTOs**: Are functions relying on TypeScript inference instead of manual DTO boilerplate? Are types derived via `Awaited<ReturnType<typeof ...>>` when needed?
- [ ] **Routes Export**: Does `routes.ts` use **`export default`** for the router instance?
- [ ] **Semantic Function Naming**: Does every function name clearly, accurately, and honestly describe its actual single operation?
- [ ] **Sub-feature Route Acquisition**: Are sub-feature routers acquired by the main feature's `routes.ts` and cleanly exposed via `src/index.ts` through `/api/v1/<main-feature>`?
- [ ] **Minimal `index.ts` Facade**: Does each `index.ts` expose **ONLY** what is actively used by other features/sub-features (explicit exports, zero `export *`)?
- [ ] **Dead Code Deleted**: Is all unused code, dead functions, and obsolete imports deleted completely (never commented out)?
- [ ] **Routes Responsibilities**: Does `routes.ts` receive input, query `service`, and decide the response (returning 404 or default 200 OK)?
- [ ] **No HTTP Errors in Service**: Are all `HTTPException`, `c.json()`, and HTTP status codes removed from `service.ts`?
- [ ] **Single Responsibility**: Does each repository and service function do **1 and only 1** dedicated thing?
- [ ] **Database Round-Trips Minimized**: Are loops and redundant queries consolidated into single batch operations (`inArray`, batch inserts/updates)?
- [ ] **Strict Non-Relative Imports**: Are all imports in `src/` using `@/...` path aliases?
