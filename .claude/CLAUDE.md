This repo is a NextJS webapp using shadcn components and tailwindcss. It's the front-end of a SaaS called Trackable, an Agentic AI tool that helps users with their post-purchase experiences.

# Code Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login)
│   ├── api/                # API routes
│   │   ├── agent/chat/     # AI agent chat endpoint
│   │   ├── auth/callback/  # OAuth callback handler
│   │   ├── gmail/sync/     # Gmail synchronization
│   │   ├── gmail/watch/    # Gmail watch registration
│   │   └── gmail/webhook/  # Gmail push notifications
│   │   └── orders/         # Order-related endpoints
│   └── app/                # Protected app pages
│       ├── chat/           # AI chat interface
│       ├── orders/         # Order management
│       ├── returns/        # Return management
│       └── settings/       # User settings
├── components/
│   ├── ui/                 # Shadcn components
│   ├── layout/             # Header, sidebar, mobile-nav
│   ├── chat/               # Chat UI components
│   ├── agent/              # AI agent components
│   ├── dashboard/          # App dashboard UI
│   ├── orders/             # Order-specific components
│   └── common/             # Shared utilities
├── lib/
│   ├── supabase/           # Database client & middleware
│   ├── gmail/              # Gmail API integration
│   ├── trackable-agent/    # Trackable-agent integration helpers
│   ├── tracking/           # Shipment tracking
│   └── utils.ts            # Shared utilities
├── proxy.ts                # Local proxy helpers
├── types/                  # TypeScript type definitions
└── data/                   # Mock data for development
```

**Key conventions:**

- Path alias `@/` → `src/`
- Shadcn UI components (New York style)
- Supabase for auth & database
- Vercel AI SDK for chat UI streaming (all LLM calls happen in the backend)
- Zustand for client state management
- API routes must include Supabase user auth check (except public endpoints like health checks)

# API Backend

API backend is deployed on Google Cloud Run at api.usetrackable.ai, the code can be found under `./ingress-api` (symbolic link to a local clone of the trackable-agent repo).

- The OpenAPI specification is available at https://api.usetrackable.ai/openapi.json

## Chat API Proxy

The chat UI connects to trackable-agent via `/api/agent/chat` proxy rather than directly. This proxy exists because:

1. **Protocol adaptation**: Vercel AI SDK expects its Data Stream format (`start`, `text-delta`, `finish`), while trackable-agent uses OpenAI-compatible SSE format. The proxy transforms between these via `src/lib/trackable-agent/sse-transformer.ts`.

2. **Session management**: The backend manages sessions per-user via the `user` field in the OpenAI-compatible request format.

3. **Auth tokens**: Placeholder for GCP Identity Token injection in production.

4. **CORS simplicity**: Same-origin requests avoid cross-origin configuration.

The backend exposes an OpenAI-compatible endpoint at `/api/v1/chat/completions` (see `docs/openapi.yaml` in trackable-agent repo).

# Important Notes

You must avoid using heredoc syntax (`<<'EOF'`) when sandbox mode is enabled, as it blocks temp file creation outside `/tmp/claude/`. Use simple quoted strings instead.
