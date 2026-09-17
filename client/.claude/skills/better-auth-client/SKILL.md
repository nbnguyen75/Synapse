---
name: better-auth-client
description: How to use the Better-Auth client anywhere in the desktop app that needs to know the current session — reading auth state, guarding a route, calling an authenticated endpoint, or handling sign-out. Use this for any "is the user logged in" or "who is the current user" need, not just the login flow itself (that's `desktop-auth`).
---

# Better-Auth Client

- Read session state through the Better-Auth client's session hook/store — never re-derive it from a raw token yourself.
- Treat `pending`/`loading` session state explicitly; don't flash a logged-out UI while the session is still resolving.
- Any authenticated HTTP call goes through one shared client wrapper that attaches the session token — don't attach headers ad hoc per call site.
- On a 401 from the backend: treat it as "session invalid," route back into the login flow (see `desktop-auth`) — don't retry silently or show a generic error.
- Sign-out clears the OS-backed secure storage (see `SECURITY.md`) and returns to the login flow; it does not just clear in-memory state.
