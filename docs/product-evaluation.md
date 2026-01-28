# Product Management Evaluation: Trackable

**Date:** January 27, 2026
**Status:** Pre-Launch Assessment

---

## Executive Summary

**Trackable** is an AI-first, agentic personal shopping assistant that automates post-purchase management. The product addresses a validated pain point (missed return windows, fragmented order tracking) with a differentiated approach (AI agent vs. passive dashboard).

**Overall Assessment:** Early-stage MVP with strong technical foundation, clear value proposition, but significant gaps in data connectivity and user validation.

---

## 1. Problem Validation

### Problem Statement

Consumers lose money and time due to fragmented post-purchase experiences:

- 20-30% average return rates (40%+ in apparel)
- Missed return windows → forfeited refunds
- Manual tracking across emails, carrier sites, merchant policies
- Confusing return policies require research

### Validation Checklist

| Criteria | Status | Notes |
|----------|--------|-------|
| Problem clearly articulated? | ✅ | Strong messaging on landing page |
| Validated with real users? | ⚠️ **Unknown** | No user research artifacts found |
| Frequent/painful enough? | ✅ | Industry data supports (e-commerce return rates) |
| Users will pay/engage? | ⚠️ **Untested** | Free tier only; no conversion data |
| Technically feasible? | ✅ | MVP implemented with working integrations |

### Risk: Unvalidated Assumptions

The testimonials on the landing page appear to be **placeholder/fabricated** (generic personas like "Working Parent", "College Student", "Online Shopper"). No evidence of actual user interviews or feedback.

**Recommendation:** Conduct 10-15 user interviews with heavy online shoppers before investing further. Validate:

- How often do users actually miss return windows?
- What's the $ value of missed returns per user/year?
- Would users trust Gmail access for this use case?

---

## 2. Product-Market Fit Signals

### Current State: Pre-PMF

| Signal | Status |
|--------|--------|
| Real user data in app | ❌ All mock data |
| Active users | ❌ Unknown |
| Retention metrics | ❌ Not tracked |
| Organic growth | ❌ No indication |
| User testimonials | ❌ Appear fabricated |

### Competitive Landscape

| Competitor | Positioning | Trackable Differentiation |
|------------|-------------|---------------------------|
| Parcel/Shop app | Passive tracking dashboards | AI agent (proactive, conversational) |
| AfterShip | B2B shipping API | B2C, Gmail-native |
| Merchant apps (Amazon, etc.) | Single-merchant tracking | Cross-merchant aggregation |

**Differentiation is strong:** The "agentic" positioning (proactive recommendations, natural language interface) is distinct from passive trackers.

---

## 3. Feature Audit

### Implemented Features

| Feature | Status | Business Value |
|---------|--------|----------------|
| Gmail OAuth integration | ✅ Complete | Core - enables zero-friction onboarding |
| Email parsing → Order extraction | ✅ Complete | Core - auto-populates orders |
| Manual order creation | ✅ Complete | Fallback for missed emails |
| Receipt/screenshot upload | ✅ Complete | Edge case handling |
| AI chat interface | ✅ Complete | Key differentiator |
| Dashboard with metrics | ⚠️ Mock data | Needs real data pipeline |
| Order list with filtering | ⚠️ Mock data | Needs real data pipeline |
| Return deadline tracking | ⚠️ Mock data | Needs real data pipeline |

### Critical Gaps

| Missing Feature | Impact | Priority |
|-----------------|--------|----------|
| **Real order data pipeline** | ❌ Blocks all value delivery | P0 |
| **Notification system** | Can't deliver proactive alerts | P0 |
| Order detail page | Incomplete user journey | P1 |
| Settings page (disconnect Gmail) | Privacy/trust concern | P1 |
| Returns management workflow | Core use case incomplete | P1 |

### Feature Prioritization (RICE)

| Feature | Reach | Impact | Confidence | Effort | RICE Score |
|---------|-------|--------|------------|--------|------------|
| Real data pipeline | 100% | 3.0 | 90% | 2 PM | **135** |
| Email/push notifications | 100% | 2.0 | 80% | 1 PM | **160** |
| Order detail page | 80% | 1.0 | 90% | 0.5 PM | **144** |
| Gmail disconnect flow | 30% | 2.0 | 95% | 0.25 PM | **228** |
| Returns workflow | 40% | 2.0 | 70% | 1.5 PM | **37** |

**Top priorities:**

1. Gmail disconnect flow (trust/compliance critical)
2. Email notifications (delivers core value proposition)
3. Order detail page (completes journey)
4. Real data pipeline (already partially built in backend)

---

## 4. Technical Architecture Assessment

### Strengths

- **Clean separation:** Frontend (Next.js) / Backend (trackable-agent on Cloud Run)
- **Modern stack:** Vercel AI SDK, streaming chat, Supabase auth
- **Privacy-conscious design:** Gmail read-only scope, no write access
- **Extensible data model:** Well-typed Order, Shipment, Return structures

### Concerns

| Issue | Risk Level | Recommendation |
|-------|------------|----------------|
| Mock data throughout app | High | Connect to real backend ASAP |
| No error boundaries/states | Medium | Add loading, error, empty states |
| No analytics/tracking | High | Add event tracking for conversion funnel |
| Hardcoded UI strings | Low | Extract to i18n system for scale |

---

## 5. Business Model Analysis

### Current: Free Forever

- **Pro:** Low friction, builds user base
- **Con:** No path to revenue, unsustainable

### Monetization Opportunities

| Model | Fit | Notes |
|-------|-----|-------|
| Freemium (premium features) | Good | Charge for auto-return submission, advanced alerts |
| Affiliate/cashback | Good | Partner with merchants for return shipping |
| B2B licensing | Medium | License to e-commerce platforms |
| Data insights (anonymized) | Risky | Contradicts privacy positioning |

**Recommendation:** Maintain free core product, monetize through:

1. **Premium tier:** Automated return label generation, priority support
2. **Merchant partnerships:** Affiliate fees for "easy return" merchants

---

## 6. Go-to-Market Readiness

### Go/No-Go Checklist

| Criteria | Status |
|----------|--------|
| Solves validated user problem | ⚠️ Assumed, not validated |
| Core value delivered | ❌ Mock data blocks value |
| Moves key metrics | ❌ No metrics defined |
| Team can maintain | ✅ Clean codebase |
| Competitive differentiation | ✅ AI agent positioning |

**Verdict: NOT READY for launch.**

### Pre-Launch Requirements

- [ ] Connect real order data from backend
- [ ] Implement notification system
- [ ] Add analytics (Mixpanel/Amplitude/PostHog)
- [ ] Define success metrics (see below)
- [ ] Validate with 10+ real beta users
- [ ] Complete legal pages (Privacy Policy, ToS)

---

## 7. Success Metrics Framework

### North Star Metric

**$ Saved per User per Month** (from return deadline alerts that led to successful returns)

### Supporting Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Activation:** Gmail connected | 60% of signups | Supabase events |
| **Engagement:** Orders discovered | 5+ orders in first week | Backend tracking |
| **Retention:** WAU/MAU ratio | >40% | Analytics |
| **Value:** Deadline alerts viewed | >2 per user/month | Event tracking |
| **Outcome:** Returns initiated via Trackable | Track manually initially | User surveys |

### Metrics NOT to Track (Vanity)

- Total signups (without activation)
- Page views
- Chat messages sent (without outcomes)

---

## 8. Actionable Recommendations

### Immediate (Next 2 Sprints)

#### 1. User Research Sprint

- Interview 15 heavy online shoppers
- Validate: pain intensity, Gmail trust, willingness to adopt
- Deliverable: Research synthesis document

#### 2. Data Pipeline Completion

- Connect frontend to real backend orders
- Remove all mock data dependencies
- Deliverable: Working orders list with real Gmail sync

#### 3. Analytics Implementation

- Add event tracking to core flows
- Set up funnel: Landing → Signup → Gmail Connect → First Order
- Deliverable: Dashboard showing conversion rates

### Near-Term (Next Quarter)

#### 4. Notification System

- Email alerts for return deadlines (3 days, 1 day before)
- In-app notification center
- Push notifications (PWA or native consideration)

#### 5. Beta Launch

- 50-100 users via waitlist or ProductHunt
- Collect qualitative feedback
- Iterate on AI agent responses

#### 6. Legal/Compliance

- Complete Privacy Policy (Gmail data handling)
- Terms of Service
- Cookie consent (if needed)

### Strategic (6+ Months)

#### 7. Monetization Test

- A/B test premium tier messaging
- Explore merchant partnerships

#### 8. Platform Expansion

- Outlook/Yahoo integration
- Mobile app (React Native or native)

---

## Summary

Trackable has a **compelling value proposition** (AI agent for post-purchase) and **solid technical foundation**, but is **not ready for market** due to:

1. **Unvalidated assumptions** about user pain and trust
2. **Mock data** throughout the app
3. **Missing critical features** (notifications, real data pipeline)
4. **No success metrics** or analytics

**Next step:** Conduct user research to validate the problem before investing in further development. The technical work to date is good, but shipping requires closing the user-facing gaps first.
