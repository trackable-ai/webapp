# Trackable: Personal Shopping Agent

**Your AI-first companion for post-purchase experiences.**

Trackable eliminates the friction of managing online orders by acting as an intelligent agent that monitors your purchases, tracks deliveries, and proactively helps you with returns and exchanges—all starting from your inbox.

## 🚀 Overview

Post-purchase management is broken. We miss return windows, lose receipts in our inbox, and waste time decoding return policies.

**Trackable solves this by:**
- **👀 Observing:** Automatically detecting orders and deliveries via Gmail integration.
- **🧠 Reasoning:** Understanding return policies, deadlines, and item details.
- **🗣️ Acting:** Proactively notifying you of upcoming deadlines and guiding you through return processes via natural language chat.

This is not just another dashboard; it's an **agent** that works for you.

## ✨ Features (MVP)

*   **Gmail Integration (OAuth)**: Connects securely to your inbox to auto-detect order confirmations and delivery updates.
*   **Order Awareness**: Maintains a continuously updated list of your active orders and their status.
*   **Shipment Tracking**: Normalized tracking across carriers.
*   **Return Policy Analysis**: AI-powered extraction of return windows and policies from emails/policies.
*   **Proactive Alerts**: Notifies you *before* deadlines expire (e.g., "3 days left to return these shoes").
*   **Agent Chat**: Ask questions naturally like "Can I still return the Nike order?" or "Start an exchange."
*   **Image Ingestion**: Upload screenshots of receipts for manual tracking.

## 🛠 Tech Stack

*   **Frontend**: [Next.js (App Router)](https://nextjs.org/) + [React](https://react.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **Backend/Auth**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime)
*   **Integrations**: [Gmail API](https://developers.google.com/gmail/api)
*   **AI Agent**: Communicates with `trackable-agent` service (using OpenAI-compatible API).

## ⚡ Getting Started

### Prerequisites

*   Node.js 18+
*   pnpm (`npm install -g pnpm`)
*   A [Supabase](https://supabase.com/) project
*   A [Google Cloud Project](https://console.cloud.google.com/) with Gmail API enabled (for OAuth)

### Environment Setup

1.  Copy the example environment file:
    ```bash
    cp .env.example .env.local
    ```

2.  Fill in your credentials in `.env.local`:
    ```env
    # Site URL (used for OAuth redirect URLs)
    NEXT_PUBLIC_SITE_URL=http://localhost:3000

    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

    # Google OAuth (for Gmail integration)
    GOOGLE_CLIENT_ID=your-client-id
    GOOGLE_CLIENT_SECRET=your-client-secret
    ```

### Running Locally

1.  Install dependencies:
    ```bash
    pnpm install
    ```

2.  Start the development server:
    ```bash
    pnpm dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Project Structure

```
├── src/app             # Next.js App Router pages & API routes
│   ├── (auth)          # Authentication routes (login)
│   ├── api             # Backend API routes (agent, gmail, orders)
│   └── app             # Protected application routes (dashboard)
├── src/components      # React components
│   ├── agent           # AI Agent interface components
│   ├── dashboard       # Dashboard widgets
│   ├── orders          # Order management UI
│   └── ui              # Reusable UI components (shadcn)
├── src/lib             # Utility libraries
│   ├── gmail           # Gmail API client & sync logic
│   ├── supabase        # Supabase client & auth helpers
│   └── trackable-agent # AI Agent service client
├── docs                # Documentation & PRDs
└── public              # Static assets
```

## 🚢 Deployment

The project is configured for deployment on **Google Cloud Run**. See `cloudbuild.yaml` for build configuration.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

Built with ❤️ by the Trackable AI team.
