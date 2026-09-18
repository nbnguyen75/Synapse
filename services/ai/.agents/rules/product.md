# Product Rules — Synapse AI Service

Synapse is an AI-native personal knowledge assistant with RAG-powered note chat and agentic reminders.

These gates apply to every feature decision, always:

- **AI Service Scope**: This service is dedicated to embeddings generation, semantic search (pgvector), conversation lifecycle, LLM streaming, user AI preferences, and note assistant tools.
- **V1 before V2/V3**: Ship the simplest functional implementation first before adding speculative capabilities.
- **Confirm Before Persisting / Actioning**: External integrations and AI tools must strictly operate within defined schema bounds and require explicit user context.
- **RAG & Vector Integrity**: Embeddings and note search must respect user boundary isolation (`userId`) and privacy tags. Never mix or leak cross-user note contexts.
- **Clean Architecture & Modularity**: Follow domain module boundaries (`route.ts` -> `services.ts` -> `repository.ts`) on Hono + Bun + PostgreSQL (Drizzle ORM) + Vercel AI SDK.
