---
name: backend-architecture
description: ARIA backend modular monolith folder architecture and boundary rules. Use when adding new routes, database models, services, or reviewing module imports.
---

# ARIA Backend Architecture

Organized **by feature**, not by technical layer. Each feature owns its own routes, domain service, schemas, and tests under `src/features/<name>/`.

## Directory Placement

- `src/index.ts`: Application bootstrap, top-level Hono instance, middleware mounting, feature route aggregation.
- `src/features/<name>/`: A product domain feature.
   - `index.ts`: Public API export for the feature. **CHỈ export tường minh những gì cần thiết (`export { ... }`), TUYỆT ĐỐI KHÔNG export `*`.**
   - `routes.ts`: Hono sub-app exposing HTTP routes (`/api/v1/<feature>`). Chịu trách nhiệm nhận request, validation, dispatch response và xử lý HTTP status/errors (kể cả 404 hoặc throw HTTPException). Sử dụng `http-status-codes` cho StatusCodes và ReasonPhrases làm title.
   - `service.ts`: Business logic, domain rules, calculation, service orchestration. Không tạo HTTP response trực tiếp.
   - `repository.ts`: Chứa tất cả code lưu và lấy data (DB queries, Drizzle operations). Service gọi repository.
   - `schemas.ts`: Zod validation schemas for input/output.
   - `types.ts`: Domain-specific types.
   - `__tests__/`: Automated API and unit tests (`*.test.ts`).
   - `<submodule>/`: Các module nhỏ bên trong domain feature (ví dụ `features/ai/chat/`, `features/ai/embedding/`, `features/ai/router/`). Mỗi sub-module PHẢI có file `index.ts` riêng để expose các functions/schemas/types ra bên ngoài.
- `src/db/`: Database Client singleton (`client.ts`) and Drizzle schema (`schema.ts`).
- `src/middleware/`: Reusable Hono middlewares (e.g. auth guard, logger, CORS, error handler).
- `src/config/`: Environment variables parsing and configuration validation.

## Non-Relative Imports & Export Boundaries

- **Strict Non-Relative Imports for ALL Files in `src/`**: TẤT CẢ các file nằm trong thư mục `src/` BẮT BUỘC dùng non-relative path alias (`@/...`). TUYỆT ĐỐI CẤM sử dụng relative imports (`../`, `./`) ở bất kỳ đâu trong `src/` (kể cả các file trong cùng một folder).
- **Feature Root Public Interface**: External modules và `src/index.ts` MUST chỉ import từ root của feature: `@/features/<feature>`.
- **Sub-module Public Interface & Cross-Submodule Imports**:
   - Mỗi folder/sub-module là 1 discrete unit có file `index.ts` riêng.
   - Khi các sub-modules trong cùng feature tương tác với nhau (ví dụ: `chat` cần dùng `embedding`), import non-relative trực tiếp từ sub-module:
      ```ts
      import { generateEmbedding } from '@/features/ai/embedding';
      ```
- **No Wildcard Exports**: File `index.ts` (ở feature root hay ở sub-module) không được dùng `export *`. Chỉ export tường minh các public symbols / router được phép dùng bên ngoài (`export { funcA, funcB }`).
- **No Namespace / Wrapper Objects Export**: TUYỆT ĐỐI KHÔNG gom nhóm các functions vào object để export (ví dụ: cấm `export const aiRouter = { isQuotaError, resolveActiveModel, routeAndGenerate }` hay `export const notesService = { ... }`). CHỈ export plain standalone functions (`export function ...` / `export async function ...` hoặc `export { funcA, funcB }`).
- **Sub-module Encapsulation**: External callers (bên ngoài feature) KHÔNG ĐƯỢC import trực tiếp vào sub-modules nội bộ (ví dụ: cấm bên ngoài import `@/features/ai/chat/...`). Mọi export ra ngoài feature phải qua `src/features/ai/index.ts`.

## Single Responsibility Principle (SRP) by Layer

- **Repository (`repository.ts`)**: Pure data persistence. Queries and mutations only. Business rules, orchestration, calculations, or HTTP response handling are strict violations.
- **Service (`service.ts`)**: Business logic, workflows, rule enforcement, calculation. Calls repository for persistence. Must not query Drizzle directly, nor construct HTTP responses.
- **Routes (`routes.ts`)**: HTTP transport, parameter & schema validation, error mapping & response dispatching. Must not query the database or implement business workflows directly.

## Allowed Dependencies

```text
src/index.ts       → src/features/* (chỉ từ root feature), src/middleware/*, src/config/*
features/<name>    → src/db (via repository only), src/config, src/middleware
submodule A        → submodule B (cùng feature, import qua @/features/<feature>/<submoduleB>)
```

## Disallowed Boundaries

- `featureA` → direct DB mutation of `featureB` private tables.
- UI or external clients accessing DB directly.
- Exporting bundled namespace objects (e.g. `export const service = { ... }`).
- Wildcard exports `export * from ...` trong `index.ts`.
- External modules importing sâu vào sub-modules nội bộ thay vì feature root (e.g. `@/features/ai/chat/...` from outside feature).
- Relative imports (`./` or `../`) trong `src/`.
- Business logic residing in `repository.ts`.
- Drizzle queries residing directly in `service.ts` or `routes.ts`.
- Circular dependencies between feature modules.
- Mixing Finance, Work, and Life logic.
