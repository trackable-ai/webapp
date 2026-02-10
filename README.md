# Trackable

**Your personal shopping agent.**

We all hate the post-purchase mess. Receipts buried in Gmail, return windows closing while you're busy, and navigating five different carrier sites just to see where your package is.

Trackable fixes this. It's an AI agent that lives in your inbox, watches your orders, and tells you what you need to know *before* you ask.

## What it does

Instead of a dashboard you have to manage, Trackable works for you:

*   **Connects to Gmail** to find your orders automatically. No forwarding emails or manual entry.
*   **Tracks everything** in one place.
*   **Reads the fine print** on return policies so you don't have to.
*   **Nudges you** when a return window is about to close.
*   **Chat with it** naturally. Ask "Can I still return those Nikes?" and it just tells you.

## Tech Stack

Built with **Next.js**, **Supabase**, and **Tailwind**. It uses the **Gmail API** to find orders and talks to our `trackable-agent` service for the AI brains.

## Getting Started

You'll need a Supabase project and a Google Cloud project with the Gmail API enabled.

1.  **Clone & Setup:**
    ```bash
    cp .env.example .env.local
    pnpm install
    ```

2.  **Add Credentials** (`.env.local`):
    *   `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY`
    *   `GOOGLE_CLIENT_ID` / `SECRET` (for OAuth)

3.  **Run it:**
    ```bash
    pnpm dev
    ```

## Deployment

We deploy to **Google Cloud Run**. Check `cloudbuild.yaml` if you need to mess with the build config.

---

Built by the Trackable AI team.
