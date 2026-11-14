# Architecture rules
- Use AI SDK UI-message streaming in a TanStack server route, with request-scoped gateway helpers, so answers stream without exposing credentials.
- Keep saved assistant conversations scoped to the authenticated owner through RLS and server authorization; route-derived thread IDs isolate histories.
- Keep emergency screens public and separate from assistant authentication so signing in never blocks SOS access.
- Compose chat with installed AI Elements primitives and project design tokens to preserve accessible streaming controls and the existing theme.