# Trackable: Personal Shopping Agent

## Overview

**Product Name:** Trackable  
**Category:** AI-first, agentic consumer application  
**Problem Space:** Post-purchase experience in e-commerce  
**Primary Goal:** Eliminate post-purchase friction by letting an AI agent proactively manage everything that happens after a purchase, act on the user’s behalf to track orders, monitor deadlines, interpret return/exchange policies, and guide/initiate next steps.

Post-purchase management is increasingly painful. Average e-commerce return rates are **20–30%**, reaching **40%+ in apparel**. Yet the tooling for consumers has not evolved beyond inbox search and merchant portals.

## Problem Statement

Post-purchase workflows are fragmented, manual, and time-sensitive.

Users must:

- Search email inboxes for receipts
- Jump between carrier sites (FedEx / UPS / USPS)
- Learn return rules buried in merchant policy pages
- Manually track deadlines
- Contact support just to understand next steps

This leads to:

- Missed return windows
- Confusion between returns vs exchanges
- Wasted time and money
- Accidental item retention
- Poor overall shopping experience

### Example Scenarios

- **Monica**, a busy working mom, orders three shoe sizes to find the right fit. She forgets to return the extras before the 14-day window closes.
- **John**, a college student, wants to exchange a laptop but can’t find clear instructions and ends up emailing support after hours of searching.

The core issue is not missing information — it’s the **absence of an intelligent agent to manage it**.

## Solution

We build an **AI-first, agentic Personal Shopping Assistant** that manages post-purchase tasks on behalf of the user.

Instead of acting as a passive dashboard, the agent:

- Observes purchases automatically
- Understands policies and deadlines
- Maintains ongoing awareness of each order
- Proactively intervenes when action is needed
- Guides users through decisions using natural language

The agent becomes the **single source of truth and action** for everything after checkout.

## AI-First & Agentic Principles

This product is designed as an **agent**, not a tool.

### Core Principles

1. **Proactive, Not Reactive**

   - The agent surfaces issues before users ask
   - Example: “Your return window closes in 3 days”

2. **Goal-Oriented**

   - Optimize for:
     - Avoiding missed deadlines
     - Minimizing wasted spend
     - Reducing support friction

3. **Natural Language as the Primary Interface**

   - Users can ask:
     - “Can I still return this?”
     - “Start an exchange for a smaller size”

4. **Minimal User Effort**

   - No forms by default
   - Email ingestion, screenshots, photos, and one-tap confirmations

5. **Human-in-the-Loop Control**
   - The agent recommends and prepares actions
   - Users approve execution in MVP

## Target Users

### Primary Users

1. Frequent online shoppers (high return rates)
2. Busy professionals and parents
3. Students and budget-sensitive shoppers

### Secondary Users

- Gift buyers
- Cross-border shoppers
- Subscription shoppers

## User Jobs to Be Done (JTBD)

- “I don’t want to think about return deadlines.”
- “I want to know what I can do with this order.”
- “I want help without searching or emailing support.”
- “I want to avoid losing money due to inaction.”

## Platform Strategy

### MVP Strategy (AI-First, Gmail-First)

- **Primary Signal Source:** Gmail (via OAuth)
- **Primary Interface:** Web application
- **Secondary Input:** Screenshot / photo sharing
- **Primary Output:** Agent-initiated messages and recommendations

The web app functions as the **agent’s workspace**, not a traditional CRUD dashboard.

### Rationale

- Gmail is the most reliable source of order confirmations
- OAuth solves the cold-start problem
- Web enables fast iteration, trust, and onboarding
- Email notifications are sufficient for early interventions

### Long-Term Direction

- Native mobile apps become the primary surface for:
  - Push notifications
  - Image-first ingestion
  - Ambient agent presence
- Email remains a perception layer, not the UI

## Agent Capabilities (MVP)

### Order Awareness (Agent Perception)

The agent continuously observes and maintains awareness of user purchases.

**Inputs**

- Gmail order confirmation emails (OAuth)
- User-shared screenshots or photos

**Responsibilities**

- Detect new purchases automatically
- Maintain a normalized internal order model
- Resolve ambiguity over time
- Ask clarification questions only when necessary

Users do not “add orders” — the agent **discovers and manages them**.

### Shipment & Delivery Tracking

- Carrier-agnostic tracking
- Normalized delivery status
- Delivery confirmation triggers return-window logic

### Return & Exchange Planning (Agent Reasoning)

For each order, the agent:

- Interprets return and exchange policies
- Determines eligibility and deadlines
- Evaluates available options
- Recommends the best next action

Example:

“These shoes are returnable until Feb 12\.  
Since you reordered a different size, returning is recommended.  
Want me to prepare the return?”

### Agent-Initiated Interventions

The agent proactively intervenes when attention is required:

- Delivery completed → return clock starts
- Deadline approaching
- Refund delayed

**MVP Delivery Channels**

- Email notifications
- In-app messages

### Support & Action Preparation

- One-tap access to merchant support
- Pre-drafted messages with order context
- Deep links to merchant return/exchange flows

Automatic execution (e.g. submitting returns) is out of scope for MVP.

## Agent Architecture (MVP)

### Perception

- Gmail parsing
- OCR \+ layout understanding for images
- Entity extraction (orders, items, dates)

### Memory

- Persistent order state
- Policy interpretations
- User preferences (reminder sensitivity, behavior patterns)

### Reasoning

- Deadline calculation
- Policy evaluation
- Action recommendation

### Action Preparation

- Draft messages
- Prepare instructions
- Suggest next steps

## Permissions & Trust (MVP Requirement)

- Request **minimal Gmail OAuth scopes**
- Avoid write or modification scopes
- Provide:
  - Clear explanation of access
  - Disconnect Gmail
  - Delete all stored data
- Explicit guarantees:
  - No selling of email data
  - No ad targeting
  - Data used only for post-purchase management

Trust is treated as a **core product feature**.

## Non-Goals (MVP)

- Non-Gmail inbox support
- Native mobile apps
- Price tracking or deal discovery
- Pre-purchase recommendations
- Automatic return submission or refunds

## Success Metrics

### User Metrics

- Gmail connection rate
- Orders detected per user
- Manual ingestion success rate
- Return window miss rate (↓)
- Monthly active users (MAU)

### Experience Metrics

- Time to first value (first order detected)
- Time to agent recommendation
- Notification engagement rate
- Net Promoter Score (NPS)

## Risks & Mitigations

| Risk                        | Mitigation                                    |
| :-------------------------- | :-------------------------------------------- |
| OAuth trust drop-off        | Value-first onboarding, clear permission copy |
| Gmail scope review friction | Minimal scopes, narrow MVP                    |
| Messy receipts              | Image ingestion \+ confidence scoring         |
| Weak notifications on web   | Email-based interventions                     |

## Future Extensions

- Native iOS / Android apps
- Push notifications
- Refund status tracking
- Store credit & gift returns
- Merchant integrations
- Subscription, warranty, and protection plan tracking
- Expanded agent execution permissions
