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
│   ├── orders/             # Order-specific components
│   └── common/             # Shared utilities
├── lib/
│   ├── supabase/           # Database client & middleware
│   ├── gmail/              # Gmail API integration
│   ├── gemini/             # Google Gemini AI prompts
│   └── tracking/           # Shipment tracking
├── types/                  # TypeScript type definitions
└── data/                   # Mock data for development
```

**Key conventions:**
- Path alias `@/` → `src/`
- Shadcn UI components (New York style)
- Supabase for auth & database
- Google Gemini + Vercel AI SDK for AI features
- Zustand for client state management

# API Backend

API backend is deployed on Google Cloud Run at api.usetrackable.ai, a local copy of the code can be found at `~/code/trackable-agent`.

- `docs/openapi.yaml` is the OpenAPI specification for the API backend.

## Chat API Proxy

The chat UI connects to trackable-agent via `/api/agent/chat` proxy rather than directly. This proxy exists because:

1. **Protocol adaptation**: Vercel AI SDK expects a specific SSE format (`start`, `text-delta`, `finish`), while trackable-agent uses a different format (`session`, `delta`, `done`). The proxy transforms between these via `src/lib/trackable-agent/sse-transformer.ts`.

2. **Session management**: Server-side cookie handling for chat session IDs.

3. **Auth tokens**: Placeholder for GCP Identity Token injection in production.

4. **CORS simplicity**: Same-origin requests avoid cross-origin configuration.

# Important Notes

Avoid using heredoc syntax (`<<'EOF'`) for commit messages - the sandbox blocks temp file creation outside `/tmp/claude/`. Use simple quoted strings instead:

```bash
# Don't do this
git commit -m "$(cat <<'EOF'
message
EOF
)"

# Do this
git commit -m "message"
```
