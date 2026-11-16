# Architecture rules
- Use AI SDK UI-message streaming in a TanStack server route, with request-scoped gateway helpers, so answers stream without exposing credentials.
- Keep saved assistant conversations scoped to the authenticated owner through RLS and server authorization; route-derived thread IDs isolate histories.
- Keep emergency screens public and separate from assistant authentication so signing in never blocks SOS access.
- Compose chat with installed AI Elements primitives and project design tokens to preserve accessible streaming controls and the existing theme.
- Gate assistant pages on the browser session and call authenticated server functions only after session hydration; public SOS pages stay available.
- Keep a single root auth subscriber and share its hydrated state through context; the public entry screen owns login and recovery, while assistant actions require a session.
- Keep home-screen support manifest-only, with generated public icon sizes derived from the supplied original; do not register an app-shell worker.