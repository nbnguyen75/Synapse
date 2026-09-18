# Security Rule — Synapse AI Service

Auth secrets, database credentials, AI provider API keys, and endpoints are sensitive:

- Never expose provider API keys (Google Gemini / Vertex AI, Tavily), database connection strings, or auth headers in log outputs or client responses.
- Validate JWT signatures against the configured remote JWKS (`AUTH_JWKS_URL`) for all protected endpoints.
- Ensure all incoming API payloads, Pub/Sub event bodies, and query parameters are strictly validated with Zod before processing.
- Multi-tenancy & Isolation: Ensure all conversation, message, embedding, and setting queries are strictly scoped to the authenticated `userId`.
- Protect all domain endpoints with authentication middleware (except health checks and designated internal webhook/pubsub routes). Unauthorized requests must return 401 Unauthorized immediately.
